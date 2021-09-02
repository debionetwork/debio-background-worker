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
import { SetLastSubstrateBlockCommand, DeleteAllIndexesCommand, GetLastSubstrateBlockQuery } from './blocks';

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
    const eventSection = eventRoutes[event.section];
    if (eventSection) {
      this.logger.log(
        `Handling substrate event: ${event.section}.${event.method}`,
      );
      const eventMethod = new eventSection[event.method]();
      eventMethod[event.section] = event.data[0];
      await this.commandBus.execute(eventMethod);
    }
  }

  listenToEvents() {
    this.api.query.system.events(async (events) => {
      for(let i = 0; i < events.length; i++){
        const { event } = events[i];
        await this.handleEvent(event);
      }
    });
  }

  listenToNewBlock() {
    this.api.rpc.chain.subscribeNewHeads(async (header: Header) => {
      // check if env is development
      if(process.env.NODE_ENV === 'development') {
        this.logger.log('running some code in development mode');

        let lastBlockNumber = 1;

        try {
          lastBlockNumber = await this.queryBus.execute(
            new GetLastSubstrateBlockQuery(),
          );
        } catch(err) {
          this.logger.log(err);
        }

        // condition to check if last_block_number is higher than next block number
        if(lastBlockNumber > header.number.toNumber()) {
          try {
            // delete all indexes
            await this.commandBus.execute(
              new DeleteAllIndexesCommand(),
            );
          } catch(err) {
            this.logger.log(err);
          }
        }
      }
      
      this.logger.log(`Syncing Substrate Block: ${header.number.toNumber()}`)
      await this.commandBus.execute(
        new SetLastSubstrateBlockCommand(header.number.toNumber()),
      );
    });
  }

  async syncBlock() {
    let lastBlockNumber = 1;
    try {
      lastBlockNumber = await this.queryBus.execute(
        new GetLastSubstrateBlockQuery(),
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
    const chunkSize = 1000;
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
      await this.commandBus.execute(new SetLastSubstrateBlockCommand(chunkEnd));

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
