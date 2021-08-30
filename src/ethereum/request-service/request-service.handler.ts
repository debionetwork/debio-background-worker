import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Controller } from '@nestjs/common';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import {
  EthersContract,
  SmartContract,
} from 'nestjs-ethers';
import { SetLastRequestServiceBlockCommand, GetLastRequestServiceBlockQuery } from './blocks';
import { CreateServiceRequestCommand } from './request-service';
import ABI from './request-service-abi.json';

const eventRoutes = {
  ServiceRequestCreated: CreateServiceRequestCommand,
};

@Injectable()
export class RequestServiceService implements OnModuleInit {
  private contract: SmartContract;
  private readonly logger: Logger = new Logger(RequestServiceService.name);
  constructor(
    private readonly ethersContract: EthersContract,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  async onModuleInit() {
    try {
      this.contract = this.ethersContract.create(
        process.env.REQUEST_SERVICE_CONTRACT_ADDRESS,
        ABI,
      );
    } catch (err) {
      this.logger.log(err);
    }
  }
  
  listenToEvents() {
    // Map events
    for(var key in eventRoutes){
      this.contract.on(key, async (...args) => {
        const eventMethod = new eventRoutes[key](args);
        await this.commandBus.execute(eventMethod);
      });
    }
  }

  listenToNewBlock() {
    this.contract.provider.on('block', async (blockNumber) => {
      this.logger.log(`Syncing Request Service Block: ${blockNumber}`)
      await this.commandBus.execute(
        new SetLastRequestServiceBlockCommand(blockNumber),
      );
    });
  }

  async syncBlock() {
    // The furthest block is the minimalStartingBlock
    const minimalStartingBlock: number = parseInt(process.env.MINIMAL_STARTING_BLOCK);
    // Set last block number to minimalStartingBlock by default
    let lastBlockNumber = minimalStartingBlock;
    try {
      const savedLastBlock = await this.queryBus.execute(
        new GetLastRequestServiceBlockQuery(),
      );
      this.logger.log(savedLastBlock)
      if(savedLastBlock > minimalStartingBlock){
        lastBlockNumber = savedLastBlock
      }
    } catch (err) {
      this.logger.log(err);
    }
    const endBlock = await this.contract.provider.getBlockNumber();
    this.logger.log(endBlock)
    
    /**
     * Process logs in chunks of blocks
     * */
    const chunkSize = 10000;
    let chunkStart = lastBlockNumber;
    let chunkEnd = endBlock;
    // If chunkEnd is more than chunkSize, set chunkEnd to chunkSize
    if (chunkEnd - chunkStart > chunkSize) {
      chunkEnd = chunkStart + chunkSize;
    }
    while (chunkStart < chunkEnd) {
      this.logger.log(`Syncing block ${chunkStart} - ${chunkEnd}`);
      
      // this.contract.filters.Transfer(
      //   null,
      //   '0x42D57aAA086Ee6575Ddd3b502af1b07aEa91E495',
      // );

      // Remember the last block number processed
      await this.commandBus.execute(new SetLastRequestServiceBlockCommand(chunkEnd));

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

@Controller('requestService')
export class RequestServiceController {
  requestServiceService: RequestServiceService;
  constructor(requestServiceService: RequestServiceService) {
    this.requestServiceService = requestServiceService;
  }

  async onApplicationBootstrap() {
    await this.requestServiceService.syncBlock();
    this.requestServiceService.listenToEvents();
    this.requestServiceService.listenToNewBlock();
  }
}
