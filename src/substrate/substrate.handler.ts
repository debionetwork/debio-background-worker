import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Controller, Get } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Header, Event } from '@polkadot/types/interfaces';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { BlockMetaData } from './models/blockMetaData'
import {
  LabRegisteredCommand,
  LabUpdatedCommand,
  LabDeregisteredCommand,
  LabUpdateVerificationStatusCommand,
} from './labs';
import {
  ServiceCreatedCommand,
  ServiceUpdatedCommand,
  ServiceDeletedCommand,
} from './services';
import {
  OrderCancelledCommand,
  OrderCreatedCommand,
  OrderFailedCommand,
  OrderFulfilledCommand,
  OrderPaidCommand,
  OrderRefundedCommand,
} from './orders';
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
} from './service-request';
import {
  CertificationCreatedCommand,
  CertificationUpdatedCommand,
  CertificationDeletedCommand
} from './certifications';
import { DataStakedCommand } from './genetic-testing';

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
  private head: any;
  private event: any;
  private listenStatus: boolean = false;
  private api: ApiPromise;
  private readonly logger: Logger = new Logger(SubstrateService.name);
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  async onModuleInit() {
    const wsProvider = new WsProvider(process.env.SUBSTRATE_URL);
    this.api = await ApiPromise.create({
      provider: wsProvider,
    });
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

  async listenToEvents() {
    await this.api.query.system.events(async (events) => {
      try {
        const currentBlock        = await this.api.rpc.chain.getBlock();
        const currentBlockNumber  = currentBlock.block.header.number.toNumber();
        const blockHash           = await this.api.rpc.chain.getBlockHash(currentBlockNumber);
  
        const blockMetaData: BlockMetaData = {
          blockNumber: currentBlockNumber,
          blockHash: blockHash.toString()
        }
  
        for (let i = 0; i < events.length; i++) {
          const { event } = events[i];
          await this.handleEvent(blockMetaData, event);
        }
      } catch (err) {
        this.logger.log(`Handling listen to event catch : ${err.name}, ${err.message}, ${err.stack}`);
      }
    }).then(_unsub => {
      this.event = _unsub;
    }).catch(err => {
      this.logger.log(`Event listener catch error ${err.name}, ${err.message}, ${err.stack}`);
      this.listenStatus = false;
      this.startListen();
    });
  }

  async listenToNewBlock() {
    await this.api.rpc.chain.subscribeNewHeads(async (header: Header) => {
      try {
        const blockNumber = header.number.toNumber();

        // check if env is development
        if (process.env.NODE_ENV === 'development') {
          const lastBlockNumber = await this.queryBus.execute(
            new GetLastSubstrateBlockQuery(),
          );

          // check if last_block_number is higher than next block number
          if (lastBlockNumber > blockNumber) {
            console.log('haha');
            // delete all indexes
            await this.commandBus.execute(new DeleteAllIndexesCommand());
          }
        }
        
        this.logger.log(`Syncing Substrate Block: ${blockNumber}`);

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
      this.listenStatus = false;
      this.startListen();
    });;
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
          // Get the event records in the block
          const allEventRecords = await this.api.query.system.events.at(
            signedBlock.block.header.hash,
          );
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
    
    if (this.head || this.event) {
      this.head();
      this.event();
    }

    await this.syncBlock();
    this.listenToEvents();
    this.listenToNewBlock();
  }

  // Delete this function after testing finished
  stopListen() {
    this.listenStatus = false;
    if (this.head || this.event) {
      this.head();
      this.event();
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

  // Delete this route get after test finished
  @Get("/start")
  async startProgress() {
    await this.substrateService.startListen();
  }

  // Delete this route get after test finished
  @Get("/stop")
  stopProgress() {
    this.substrateService.stopListen();
  }
}
