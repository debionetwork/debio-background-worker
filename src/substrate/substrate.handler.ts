import types from '../../types.json';
import { CommandBus } from '@nestjs/cqrs';
import { Controller } from '@nestjs/common';  
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Header, Event } from '@polkadot/types/interfaces';
import {
  Injectable,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { 
    LabRegisteredCommand,
    LabUpdatedCommand,
    LabDeregisteredCommand
} from './labs';
import { 
    ServiceCreatedCommand,
    ServiceUpdatedCommand,
    ServiceDeletedCommand
} from './services';
import { SetLastBlockCommand, GetLastBlockCommand } from './blocks';

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
  }
}

@Injectable()
export class SubstrateService implements OnModuleInit {
  private api: ApiPromise;
  private readonly logger: Logger = new Logger(SubstrateService.name);
  constructor(private commandBus: CommandBus) {}

  async onModuleInit() {
    const wsProvider = new WsProvider(process.env.SUBSTRATE_URL);
    this.api = await ApiPromise.create({
      provider: wsProvider,
      types: types,
    });
  }

  handleEvent(event: Event) {
    this.logger.log(`Handling substrate event: ${event.section}.${event.method}`);
    const eventSection = eventRoutes[event.section]
    if(eventSection) {
      const eventMethod = new eventSection[event.method]();
      eventMethod[event.section] = event.data[0];
      this.commandBus.execute(eventMethod);
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
      this.commandBus.execute(new SetLastBlockCommand(header.number.toNumber()));
    });
  }

  async syncBlock() {
    const lastBlockNumber = await this.commandBus.execute(new GetLastBlockCommand());
    const currentBlock = await this.api.rpc.chain.getBlock();
    const currentBlockNumber = currentBlock.block.header.number.toNumber();
    /**
     * Process logs in chunks of blocks
     * */
    const endBlock = currentBlockNumber;
    const chunkSize = 200;
    let iStart = lastBlockNumber;
    let iEnd = currentBlockNumber;
    if (iEnd - iStart > chunkSize) {
      iEnd = iStart + chunkSize;
    }
    while (iStart < endBlock) {
      this.logger.log(`Syncing ${iStart} - ${iEnd}`);
      for (let i = iStart; i <= iEnd; i++) {
        // Get block by block number
        const blockHash = await this.api.rpc.chain.getBlockHash(i);
        const signedBlock = await this.api.rpc.chain.getBlock(blockHash);
        // Get the event records in the block
        const allEventRecords = await this.api.query.system.events.at(signedBlock.block.header.hash);
        signedBlock.block.extrinsics.forEach(({ method: { method, section } }, index) => {
          // filter the specific events based on the phase and then the
          // index of our extrinsic in the block
          allEventRecords
            .filter(({ phase }) =>
              phase.isApplyExtrinsic &&
              phase.asApplyExtrinsic.eq(index)
            )
            .map(({ event }) => {
              this.handleEvent(event);
            });
        });
      }
      // Remember the last block number processed
      await this.commandBus.execute(new SetLastBlockCommand(iEnd))

      iStart = iEnd + 1;
      iEnd = iEnd + chunkSize > endBlock ? endBlock : iEnd + chunkSize;
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