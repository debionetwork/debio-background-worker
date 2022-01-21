import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Controller } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Header, Event } from '@polkadot/types/interfaces';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { BlockMetaData } from './models/blockMetaData'
import {
  LabRegisteredCommand,
  LabUpdatedCommand,
  LabDeregisteredCommand,
  LabUpdateVerificationStatusCommand,
} from './events/labs';
import {
  ServiceCreatedCommand,
  ServiceUpdatedCommand,
  ServiceDeletedCommand,
} from './events/services';
import {
  OrderCancelledCommand,
  OrderCreatedCommand,
  OrderFailedCommand,
  OrderFulfilledCommand,
  OrderPaidCommand,
  OrderRefundedCommand,
} from './events/orders';
import { 
  SetLastSubstrateBlockCommand, 
  DeleteAllIndexesCommand, 
  GetLastSubstrateBlockQuery,
} from './blocks';
import {
  CreateServiceRequestCommand,
  ClaimedServiceRequestCommand,
  ProcessedServiceRequestCommand,
  FinalizedServiceRequestCommand,
  UnstakedServiceRequestCommand,
  UnstakedWaitingServiceRequestCommand
} from './events/service-request';
import {
  CertificationCreatedCommand,
  CertificationUpdatedCommand,
  CertificationDeletedCommand
} from './events/certifications';
import { DataStakedCommand } from './events/genetic-testing';
import { ProcessEnvProxy } from '../common/process-env/process-env.proxy';

const eventRoutes = {
  labs: {
    LabRegistered: LabRegisteredCommand,
    LabUpdated: LabUpdatedCommand,
    LabDeregistered: LabDeregisteredCommand,
    LabUpdateVerificationStatus: LabUpdateVerificationStatusCommand,
  },
  orders: {
    OrderCreated: OrderCreatedCommand,
    OrderPaid: OrderPaidCommand,
    OrderFulfilled: OrderFulfilledCommand,
    OrderRefunded: OrderRefundedCommand,
    OrderCancelled: OrderCancelledCommand,
    OrderFailed: OrderFailedCommand,
  },
  services: {
    ServiceCreated: ServiceCreatedCommand,
    ServiceUpdated: ServiceUpdatedCommand,
    ServiceDeleted: ServiceDeletedCommand,
  },
  geneticTesting: {
    DataStaked: DataStakedCommand,
  },
  serviceRequest: {
    ServiceRequestCreated: CreateServiceRequestCommand,
    ServiceRequestClaimed: ClaimedServiceRequestCommand,
    ServiceRequestProcessed: ProcessedServiceRequestCommand,
    ServiceRequestFinalized: FinalizedServiceRequestCommand,
    ServiceRequestUnstaked: UnstakedServiceRequestCommand,
    ServiceRequestWaitingForUnstaked: UnstakedWaitingServiceRequestCommand
  },
  certifications: {
    CertificationCreated: CertificationCreatedCommand,
    CertificationUpdated: CertificationUpdatedCommand,
    CertificationDeleted: CertificationDeletedCommand
  }
};

@Injectable()
export class SubstrateService implements OnModuleInit {
  private head;
  private listenStatus = false;
  private api: ApiPromise;
  private lastBlockNumber = 0;
  private wsProvider: WsProvider;
  private readonly logger: Logger = new Logger(SubstrateService.name);
  constructor(
    private commandBus: CommandBus, 
    private queryBus: QueryBus,
    private process: ProcessEnvProxy) {}

  onModuleInit() {
    this.wsProvider = new WsProvider(this.process.env.SUBSTRATE_URL);
  }

  async handleEvent(blockMetaData: BlockMetaData, event: Event) {
    try {
      const eventSection = eventRoutes[event.section];
      
      if (eventSection && eventSection[event.method]) {
        this.logger.log(`Handling substrate event: ${event.section}.${event.method}`);
        
        const eventMethod = new eventSection[event.method](event.data, blockMetaData);
        
        await this.commandBus.execute(eventMethod);
      }
    } catch (err) {
      this.logger.log(`Handling substrate catch : ${err.name}, ${err.message}, ${err.stack}`);
    }
  }

  async eventFromBlock(blockNumber: number, blockHash: string | Uint8Array) {
    const apiAt = await this.api.at(blockHash);

    const allEventsFromBlock = await apiAt.query.system.events();

    const events = allEventsFromBlock.filter(({ phase }) => phase.isApplyExtrinsic);

    const blockMetaData: BlockMetaData = {
      blockNumber: blockNumber,
      blockHash: blockHash.toString()
    }
  
    for (let i = 0; i < events.length; i++) {
      const { event } = events[i];
      await this.handleEvent(blockMetaData, event);
    }
  }

  async listenToNewBlock() {
    await this.api.rpc.chain.subscribeNewHeads(async (header: Header) => {
      try {
        const blockNumber = header.number.toNumber();
        const blockHash   = await this.api.rpc.chain.getBlockHash(blockNumber);

        // check if env is development
        if (this.process.env.NODE_ENV === 'development') {
          this.lastBlockNumber = await this.queryBus.execute(
            new GetLastSubstrateBlockQuery(),
          );
          // check if last_block_number is higher than next block number
          if (this.lastBlockNumber > blockNumber) {
            // delete all indexes
            await this.commandBus.execute(new DeleteAllIndexesCommand());
          }
        }

        if (this.lastBlockNumber == blockNumber) {
          return;
        } else {
          this.lastBlockNumber = blockNumber;
        }
        
        this.logger.log(`Syncing Substrate Block: ${blockNumber}`);

        await this.eventFromBlock(blockNumber, blockHash);
        
        await this.commandBus.execute(
          new SetLastSubstrateBlockCommand(blockNumber),
        );
      } catch (err) {
        this.logger.log(`Handling listen to new block catch : ${err.name}, ${err.message}, ${err.stack}`);
      }
    }).then(_unsub => {
      this.head = _unsub;
    }).catch(err => {
      this.logger.log(`Event listener catch error ${err.name}, ${err.message}, ${err.stack}`);
    });
  }

  async syncBlock() {
    let lastBlockNumber = 1;
    try {
      lastBlockNumber = await this.queryBus.execute(
        new GetLastSubstrateBlockQuery(),
      );
      const currentBlock        = await this.api.rpc.chain.getBlock();
      const currentBlockNumber  = currentBlock.block.header.number.toNumber();
      /**
       * Process logs in chunks of blocks
       * */
      const endBlock  = currentBlockNumber;
      const chunkSize = 1000;
      let chunkStart  = lastBlockNumber;
      let chunkEnd    = currentBlockNumber;
      // If chunkEnd is more than chunkSize, set chunkEnd to chunkSize
      if (chunkEnd - chunkStart > chunkSize) {
        chunkEnd = chunkStart + chunkSize;
      }
      while (chunkStart < endBlock) {
        this.logger.log(`Syncing block ${chunkStart} - ${chunkEnd}`);
        for (let i = chunkStart; i <= chunkEnd; i++) {
          // Get block by block number
          const blockHash   = await this.api.rpc.chain.getBlockHash(i);
          const signedBlock = await this.api.rpc.chain.getBlock(blockHash);

          const apiAt = await this.api.at(signedBlock.block.header.hash);
          // Get the event records in the block
          const allEventRecords = await apiAt.query.system.events();

          const blockMetaData: BlockMetaData = {
            blockNumber: i,
            blockHash: blockHash.toString()
          }

          for (let j = 0; j < signedBlock.block.extrinsics.length; j++) {
            const {
              method: { method, section },
            } = signedBlock.block.extrinsics[j];
            
            const events = allEventRecords.filter(
              ({ phase }) =>
                phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(j),
            );

            for (const { event } of events) {
              await this.handleEvent(blockMetaData, event);
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
        chunkEnd = chunkEnd + chunkSize > endBlock ? endBlock : chunkEnd + chunkSize;
      }
    } catch (err) {
      this.logger.log(`Handling sync block catch : ${err.name}, ${err.message}, ${err.stack}`);
    }
  }

  async startListen() {
    if (this.listenStatus) return;

    this.listenStatus = true;

    if (this.head) {
      this.head();
    }
    
    this.api = await ApiPromise.create({
      provider: this.wsProvider,
    });

    this.api.on('connected', () => {
      this.logger.log(`Substrate API Connected`);
    });

    this.api.on('disconnected', async () => {
      this.logger.log(`Substrate API Disconnected`);
      await this.stopListen();
      await this.startListen();
    });

    this.api.on('error', async (error) => {
      this.logger.log(`Substrate API Error: ${error}`);
      await this.stopListen();
      await this.startListen();
    });

    await this.api.isReady;

    await this.syncBlock();
    this.listenToNewBlock();
  }

  stopListen() {
    this.listenStatus = false;

    if (this.api) {
      delete this.api;
    }

    if (this.head) {
      this.head();
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
    await this.substrateService.startListen();
  }
}
