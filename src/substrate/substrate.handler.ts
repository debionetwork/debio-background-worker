import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Event } from '@polkadot/types/interfaces';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { BlockMetaData } from './models/blockMetaData';
import {
  LabRegisteredCommand,
  LabUpdatedCommand,
  LabDeregisteredCommand,
  LabUpdateVerificationStatusCommand,
  LabStakeSuccessfulCommand,
  LabUnstakeSuccessfulCommand,
  LabRetrieveUnstakeAmountCommand,
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
  SetLastSubstrateBlockOldCommand,
  DeleteAllIndexesCommand,
  GetLastSubstrateBlockQuery,
} from './blocks';
import {
  CreateServiceRequestCommand,
  ClaimedServiceRequestCommand,
  ProcessedServiceRequestCommand,
  FinalizedServiceRequestCommand,
  UnstakedServiceRequestCommand,
  UnstakedWaitingServiceRequestCommand,
} from './events/service-request';
import {
  CertificationCreatedCommand,
  CertificationUpdatedCommand,
  CertificationDeletedCommand,
} from './events/certifications';
import { DataStakedCommand } from './events/genetic-testing';
import { ProcessEnvProxy } from '../common/process-env/process-env.proxy';
import {
  AddGeneticDataCommand,
  RemoveGeneticDataCommand,
  UpdateGeneticDataCommand,
} from './events/genetic-data';
import {
  GeneticAnalystsQualificationCreatedCommand,
  GeneticAnalystsQualificationDeletedCommand,
  GeneticAnalystsQualificationUpdatedCommand,
} from './events/genetic-analyst-qualifications';
import {
  GeneticAnalystServicesCreatedCommand,
  GeneticAnalystServicesDeletedCommand,
  GeneticAnalystServicesUpdatedCommand,
} from './events/genetic-analyst-services';
import {
  GeneticAnalystsDeletedCommand,
  GeneticAnalystsRegisteredCommand,
  GeneticAnalystsRetrieveUnstakeAmountCommand,
  GeneticAnalystsStakeSuccessfulCommand,
  GeneticAnalystsUpdateAvailabilityStatusCommand,
  GeneticAnalystsUpdatedCommand,
  GeneticAnalystsUpdateVerificationStatusCommand,
  GeneticAnalystUnstakeSuccessfulCommand,
  GeneticAnalystVerificationFailedCommand,
} from './events/genetic-analysts';
import {
  GeneticAnalysisOrderCancelledCommand,
  GeneticAnalysisOrderCreatedCommand,
  GeneticAnalysisOrderFailedCommand,
  GeneticAnalysisOrderFulfilledCommand,
  GeneticAnalysisOrderPaidCommand,
  GeneticAnalysisOrderRefundedCommand,
} from './events/genetic-analysis-order';
import {
  GeneticAnalysisInProgressCommand,
  GeneticAnalysisRejectedCommand,
  GeneticAnalysisResultReadyCommand,
  GeneticAnalysisSubmittedCommand,
} from './events/genetic-analysis';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { u32 } from '@polkadot/types';
import { SchedulerRegistry } from '@nestjs/schedule';

const eventRoutes = {
  certifications: {
    CertificationCreated: CertificationCreatedCommand,
    CertificationUpdated: CertificationUpdatedCommand,
    CertificationDeleted: CertificationDeletedCommand,
  },
  geneticAnalysis: {
    GeneticAnalysisSubmitted: GeneticAnalysisSubmittedCommand,
    GeneticAnalysisInProgress: GeneticAnalysisInProgressCommand,
    GeneticAnalysisRejected: GeneticAnalysisRejectedCommand,
    GeneticAnalysisResultReady: GeneticAnalysisResultReadyCommand,
  },
  geneticAnalysisOrders: {
    GeneticAnalysisOrderCreated: GeneticAnalysisOrderCreatedCommand,
    GeneticAnalysisOrderPaid: GeneticAnalysisOrderPaidCommand,
    GeneticAnalysisOrderFulfilled: GeneticAnalysisOrderFulfilledCommand,
    GeneticAnalysisOrderRefunded: GeneticAnalysisOrderRefundedCommand,
    GeneticAnalysisOrderCancelled: GeneticAnalysisOrderCancelledCommand,
    GeneticAnalysisOrderFailed: GeneticAnalysisOrderFailedCommand,
  },
  geneticAnalysts: {
    GeneticAnalystRegistered: GeneticAnalystsRegisteredCommand,
    GeneticAnalystUpdated: GeneticAnalystsUpdatedCommand,
    GeneticAnalystDeleted: GeneticAnalystsDeletedCommand,
    GeneticAnalystUpdateVerificationStatus:
      GeneticAnalystsUpdateVerificationStatusCommand,
    GeneticAnalystStakeSuccessful: GeneticAnalystsStakeSuccessfulCommand,
    GeneticAnalystUpdateAvailabilityStatus:
      GeneticAnalystsUpdateAvailabilityStatusCommand,
    GeneticAnalystUnstakeSuccessful: GeneticAnalystUnstakeSuccessfulCommand,
    GeneticAnalystRetrieveUnstakeAmount:
      GeneticAnalystsRetrieveUnstakeAmountCommand,
    GeneticAnalystVerificationFailed: GeneticAnalystVerificationFailedCommand,
  },
  geneticAnalystQualifications: {
    GeneticAnalystQualificationCreated:
      GeneticAnalystsQualificationCreatedCommand,
    GeneticAnalystQualificationUpdated:
      GeneticAnalystsQualificationUpdatedCommand,
    GeneticAnalystQualificationDeleted:
      GeneticAnalystsQualificationDeletedCommand,
  },
  geneticAnalystServices: {
    GeneticAnalystServiceCreated: GeneticAnalystServicesCreatedCommand,
    GeneticAnalystServiceUpdated: GeneticAnalystServicesUpdatedCommand,
    GeneticAnalystServiceDeleted: GeneticAnalystServicesDeletedCommand,
  },
  geneticData: {
    GeneticDataAdded: AddGeneticDataCommand,
    GeneticDataUpdated: UpdateGeneticDataCommand,
    GeneticDataRemoved: RemoveGeneticDataCommand,
  },
  geneticTesting: {
    DataStaked: DataStakedCommand,
  },
  labs: {
    LabRegistered: LabRegisteredCommand,
    LabUpdated: LabUpdatedCommand,
    LabDeregistered: LabDeregisteredCommand,
    LabUpdateVerificationStatus: LabUpdateVerificationStatusCommand,
    LabStakeSuccessful: LabStakeSuccessfulCommand,
    LabUnstakeSuccessful: LabUnstakeSuccessfulCommand,
    LabRetrieveUnstakeAmount: LabRetrieveUnstakeAmountCommand,
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
  serviceRequest: {
    ServiceRequestCreated: CreateServiceRequestCommand,
    ServiceRequestClaimed: ClaimedServiceRequestCommand,
    ServiceRequestProcessed: ProcessedServiceRequestCommand,
    ServiceRequestFinalized: FinalizedServiceRequestCommand,
    ServiceRequestUnstaked: UnstakedServiceRequestCommand,
    ServiceRequestWaitingForUnstaked: UnstakedWaitingServiceRequestCommand,
  },
};

@Injectable()
export class SubstrateService implements OnModuleInit, OnModuleDestroy {
  private listenStatus = false;
  private api: ApiPromise;
  private lastBlockNumber = 0;
  private currentSpecVersion: u32;
  private wsProvider: WsProvider;
  private isFetching = false;
  private fetchBlockInterval: NodeJS.Timer;
  private readonly logger: Logger = new Logger(SubstrateService.name);
  private isError = false;
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private process: ProcessEnvProxy,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    await this.initializeIndices();
    await this.setWsProvider();
    await this.startListen();
  }

  onModuleDestroy() {
    this.stopListen();
  }

  async setWsProvider() {
    if (this.wsProvider) {
      this.wsProvider.disconnect();
      delete this.wsProvider;
    }

    this.wsProvider = new WsProvider(this.process.env.SUBSTRATE_URL);

    this.wsProvider.on('connected', () => {
      this.logger.log(`WS Connected`);
    });

    this.wsProvider.on('disconnected', async () => {
      this.logger.log(`WS Disconnected`);
      await this.restartConnection();
    });

    this.wsProvider.on('error', async (error) => {
      this.logger.log(`WS Error: ${error}`);
      await this.restartConnection();
    });
  }

  async handleEvent(blockMetaData: BlockMetaData, event: Event) {
    try {
      const eventSection = eventRoutes[event.section];

      if (eventSection && eventSection[event.method]) {
        this.logger.log(
          `Handling substrate event: ${event.section}.${event.method}`,
        );

        const eventMethod = new eventSection[event.method](
          event.data,
          blockMetaData,
        );

        await this.commandBus.execute(eventMethod);
      }
    } catch (err) {
      this.logger.log(
        `Handling substrate catch : ${err.name}, ${err.message}, ${err.stack}`,
      );
    }
  }

  async eventFromBlock(blockNumber: number, blockHash: string | Uint8Array) {
    await this.updateMetaData(blockHash);

    const signedBlock = await this.api.rpc.chain.getBlock(blockHash);

    const apiAt = await this.api.at(signedBlock.block.header.hash);

    const blockMetaData: BlockMetaData = {
      blockNumber: blockNumber,
      blockHash: blockHash.toString(),
    };

    const allRecords = (await apiAt.query.system.events()) as any;

    signedBlock.block.extrinsics.forEach(
      // eslint-disable-next-line
      async ({ method: { method, section } }, index) => {
        // filter the specific events based on the phase and then the
        // index of our extrinsic in the block
        const events = allRecords.filter(
          ({ phase }) =>
            phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index),
        );
        for (let i = 0; i < events.length; i++) {
          const { event } = events[i];
          await this.handleEvent(blockMetaData, event);
        }
      },
    );
  }

  async listenNewBlocks() {
    if (this.isError) return;
    try {
      const currentBlock = await this.api.rpc.chain.getBlock();
      const currentBlockNumber =
        currentBlock.block.header.number.toNumber() - 1;

      if (!this.isFetching && this.lastBlockNumber !== currentBlockNumber) {
        this.isFetching = true;

        for (
          ;
          this.lastBlockNumber <= currentBlockNumber;
          this.lastBlockNumber++
        ) {
          const blockHash = await this.api.rpc.chain.getBlockHash(
            this.lastBlockNumber,
          );

          // check if env is development
          if (this.process.env.NODE_ENV === 'development') {
            await this.startDevelopment(this.lastBlockNumber);
          }

          this.logger.log(`Start => Fetch block at: ${this.lastBlockNumber}`);

          await this.eventFromBlock(this.lastBlockNumber, blockHash);

          this.logger.log(`End => Fetch block at: ${this.lastBlockNumber}`);

          await this.commandBus.execute(
            new SetLastSubstrateBlockCommand(this.lastBlockNumber),
          );
        }
      }
    } catch (err) {
      this.isError = true;
      this.logger.log(`Catch error: ${err.name}, ${err.message}, ${err.stack}`);
      await this.restartConnection();
    } finally {
      this.isFetching = false;
    }
  }

  async startDevelopment(currentFetchBlockNumber: number) {
    const blockNumber = await this.queryBus.execute(
      new GetLastSubstrateBlockQuery(),
    );

    // check if last_block_number is higher than next block number
    if (blockNumber > currentFetchBlockNumber) {
      // delete all indexes
      await this.commandBus.execute(new DeleteAllIndexesCommand());
    }
  }

  /**
   * It gets the last block number from the database, gets the current block number from the node, and
   * then processes the blocks in chunks of 1000
   */
  async syncBlock() {
    let lastBlockNumberEs = 1;
    try {
      lastBlockNumberEs = await this.queryBus.execute(
        new GetLastSubstrateBlockQuery(),
      );
      /**
       * Process logs in chunks of blocks
       * */
      const endBlock = this.lastBlockNumber;
      const chunkSize = 1000;
      let chunkStart = lastBlockNumberEs;
      let chunkEnd = this.lastBlockNumber;
      // If chunkEnd is more than chunkSize, set chunkEnd to chunkSize
      if (chunkEnd - chunkStart > chunkSize) {
        chunkEnd = chunkStart + chunkSize;
      }
      while (chunkStart < endBlock) {
        this.logger.log(`Syncing block ${chunkStart} - ${chunkEnd}`);
        for (
          let blockNumber = chunkStart;
          blockNumber <= chunkEnd;
          blockNumber++
        ) {
          // Get block by block number
          const blockHash = await this.api.rpc.chain.getBlockHash(blockNumber);

          this.logger.log(`Start => Syncing old block at: ${blockNumber}`);

          await this.eventFromBlock(blockNumber, blockHash);

          this.logger.log(
            `End => Syncing old block at: ${blockNumber} Finished`,
          );
        }
        this.logger.log(`End Syncing block ${chunkStart} - ${chunkEnd}`);
        // Remember the last block number processed
        await this.commandBus.execute(
          new SetLastSubstrateBlockOldCommand(chunkEnd),
        );

        // set chunkStart to 1 block after chunkEnd
        chunkStart = chunkEnd + 1;
        // if chunkEnd + chunkSize is more than endBlock,
        // set chunkEnd to endBlock
        // else set chunkEnd to (chunkEnd + chunkSize)
        chunkEnd =
          chunkEnd + chunkSize > endBlock ? endBlock : chunkEnd + chunkSize;
      }
      this.logger.log(`Finish Syncing old block`);
    } catch (err) {
      this.logger.log(
        `Handling sync block catch : ${err.name}, ${err.message}, ${err.stack}`,
      );
      await this.restartConnection();
    }
  }

  /**
   * It connects to the Substrate node, gets the current block number, and then starts listening for
   * new blocks
   * @returns a promise that resolves to the value of the last block number.
   */
  async startListen() {
    if (this.listenStatus) return;

    this.listenStatus = true;

    this.api = await ApiPromise.create({
      provider: this.wsProvider,
    });

    this.api.on('connected', () => {
      this.logger.log(`Substrate API Connected`);
    });

    this.api.on('disconnected', async () => {
      this.logger.log(`Substrate API Disconnected`);
      await this.restartConnection();
    });

    this.api.on('error', async (error) => {
      this.logger.log(`Substrate API Error: ${error}`);
      await this.restartConnection();
    });

    await this.api.isReady;

    this.currentSpecVersion = this.api.createType('u32');

    const currentBlock = await this.api.rpc.chain.getBlock();
    const currentBlockNumber = currentBlock.block.header.number.toNumber();

    this.lastBlockNumber = currentBlockNumber;

    this.syncBlock();

    this.fetchBlockInterval = setInterval(async () => {
      await this.listenNewBlocks();
    }, 6000);
    this.schedulerRegistry.addInterval('fetch-block', this.fetchBlockInterval);

    this.isError = false;
  }

  stopListen() {
    this.listenStatus = false;

    if (this.api) {
      this.api.disconnect();
      delete this.api;
    }

    if (this.schedulerRegistry.doesExist('interval', 'fetch-block')) {
      this.schedulerRegistry.deleteInterval('fetch-block');
      clearInterval(this.fetchBlockInterval);
    }
  }

  /**
   * It stops listening to the node, sets the websocket provider, and starts listening to the node.
   */
  async restartConnection() {
    this.logger.log('Restart connection to node.');
    this.stopListen();
    await this.setWsProvider();
    await this.startListen();
  }

  /**
   * It checks if the runtime version of the block is newer than the current runtime version, and if so,
   * it updates the metadata
   * @param {any} blockHash - The block hash of the block you want to get the metadata from.
   */
  async updateMetaData(blockHash: any) {
    const runtimeVersion = await this.api.rpc.state.getRuntimeVersion(
      blockHash,
    );
    const newSpecVersion = runtimeVersion.specVersion;

    if (newSpecVersion.gt(this.currentSpecVersion)) {
      const rpcMeta = await this.api.rpc.state.getMetadata(blockHash);
      this.currentSpecVersion = newSpecVersion;
      this.api.registry.setMetadata(rpcMeta);
    }
  }

  /**
   * If the index doesn't exist, create it
   * @param {string} index - The name of the index to create.
   */
  async initializeIndices() {
    try {
      const indices = [
        'country-service-request',
        'last-block-number-request-service',
        'create-service-request',
        'certifications',
        'labs',
        'genetic-analysis',
        'genetic-analysis-order',
        'genetic-analysts-services',
        'genetic-analysts',
        'genetic-analysts-qualification',
        'genetic-data',
        'data-bounty',
        'services',
        'orders',
        'last-block-number-substrate',
      ];

      for (const i of indices) {
        const { body: exist } = await this.elasticsearchService.indices.exists({
          index: i,
        });

        if (!exist) {
          await this.elasticsearchService.indices.create({
            index: i,
          });
        }
      }
    } catch (err) {
      this.logger.log(
        `Handling sync block catch : ${err.name}, ${err.message}, ${err.stack}`,
      );
    }
  }
}
