import types from '../../types.json';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Controller } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Header, Event } from '@polkadot/types/interfaces';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import {
  LabRegisteredCommand,
  LabUpdatedCommand,
  LabDeregisteredCommand,
} from './labs';
import {
  ServiceCreatedCommand,
  ServiceUpdatedCommand,
  ServiceDeletedCommand,
} from './services';
import { SetLastBlockCommand, GetLastBlockQuery } from './blocks';

const eventRoutes = {
  labs: {
    LabRegistered: LabRegisteredCommand,
    LabUpdated: LabUpdatedCommand,
    LabDeregistered: LabDeregisteredCommand,
  },
  services: {
    ServiceCreated: ServiceCreatedCommand,
    ServiceUpdated: ServiceUpdatedCommand,
    ServiceDeleted: ServiceDeletedCommand,
  },
};

@Injectable()
export class SubstrateService implements OnModuleInit {
  private api: ApiPromise;
  private readonly logger: Logger = new Logger(SubstrateService.name);
  constructor(private commandBus: CommandBus,
    private queryBus: QueryBus) {}

  async onModuleInit() {
    const wsProvider = new WsProvider(process.env.SUBSTRATE_URL);
    this.api = await ApiPromise.create({
      provider: wsProvider,
      types: types,
    });
  }

  async handleEvent(event: Event) {
    this.logger.log(
      `Handling substrate event: ${event.section}.${event.method}`,
    );
    const eventSection = eventRoutes[event.section];
    if (eventSection) {
      const eventMethod = new eventSection[event.method]();
      eventMethod[event.section] = event.data[0];
      await this.commandBus.execute(eventMethod);
    }
  }

  listenToEvents() {
    this.api.query.system.events((events) => {
      events.forEach((record) => {
        const { event } = record;
        this.handleEvent(event);
      });
    });
  }

  listenToNewBlock() {
    this.api.rpc.chain.subscribeNewHeads((header: Header) => {
      this.commandBus.execute(
        new SetLastBlockCommand(header.number.toNumber()),
      );
    });
  }

  async syncBlock() {
    let lastBlockNumber = 1;
    try {
      lastBlockNumber = await this.queryBus.execute(
        new GetLastBlockQuery(),
      );
    } catch (err) {
      this.logger.log(err);
    }
    const currentBlock = await this.api.rpc.chain.getBlock();
    const currentBlockNumber = currentBlock.block.header.number.toNumber();
    /**
     * Process logs in chunks of blocks
     * */
    const endBlock = currentBlockNumber;
    const chunkSize = 200;
    let chunkStart = lastBlockNumber;
    let chunkEnd = currentBlockNumber;
    // If chunkEnd is more than chunkSize, set chunkEnd to chunkSize
    if (chunkEnd - chunkStart > chunkSize) {
      chunkEnd = chunkStart + chunkSize;
    }
    while (chunkStart < endBlock) {
      this.logger.log(`Syncing block ${chunkStart} - ${chunkEnd}`);
      for (let i = chunkStart; i <= chunkEnd; i++) {
        // Get block by block number
        const blockHash = await this.api.rpc.chain.getBlockHash(i);
        const signedBlock = await this.api.rpc.chain.getBlock(blockHash);
        // Get the event records in the block
        const allEventRecords = await this.api.query.system.events.at(
          signedBlock.block.header.hash,
        );
        for (let j = 0; j < signedBlock.block.extrinsics.length; j++) {
          const {
            method: { method, section },
          } = signedBlock.block.extrinsics[j];

          const events = allEventRecords.filter(
            ({ phase }) =>
              phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(j),
          );

          for (const { event } of events) {
            await this.handleEvent(event);
          }
        }
      }
      // Remember the last block number processed
      await this.commandBus.execute(new SetLastBlockCommand(chunkEnd));

      // set chunkStart to 1 block after chunkEnd
      chunkStart = chunkEnd + 1;
      // if chunkEnd + chunkSize is more than endBlock,
      // set chunkEnd to endBlock
      // else set chunkEnd to (chunkEnd + chunkSize)
      chunkEnd =
        chunkEnd + chunkSize > endBlock ? endBlock : chunkEnd + chunkSize;
    }
  }
}

@Controller('substrate')
export class SubstrateController {
  substrateService: SubstrateService;
  constructor(substrateService: SubstrateService) {
    this.substrateService = substrateService;
  }

  async onApplicationBootstrap() {
    await this.substrateService.syncBlock();
    this.substrateService.listenToEvents();
    this.substrateService.listenToNewBlock();
  }
}
