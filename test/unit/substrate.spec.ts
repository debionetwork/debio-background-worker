import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { IndexerHandler } from '../../src/substrate/indexer.handler';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ServiceCommandHandlers } from '../../src/substrate/events/services';
import { LabCommandHandlers } from '../../src/substrate/events/labs';
import { OrderCommandHandlers } from '../../src/substrate/events/orders';
import {
  CommandBusProvider,
  ElasticSearchServiceProvider,
  substrateServiceProvider,
} from './mock';

describe('Substrate Indexer', () => {
  let substrateService: IndexerHandler;
  let commandBus: CommandBus;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElasticsearchService,
        ElasticSearchServiceProvider,
        IndexerHandler,
        substrateServiceProvider,
        CommandBus,
        CommandBusProvider,
        ...LabCommandHandlers,
        ...ServiceCommandHandlers,
        ...OrderCommandHandlers,
      ],
    }).compile();

    substrateService = module.get<IndexerHandler>(IndexerHandler);
    commandBus = module.get<CommandBus>(CommandBus);

    await module.init();
  });

  describe('Substrate', () => {
    it('Substrate Service must defined', () => {
      expect(substrateService).toBeDefined();
    });

    it('CommandBus must defined', () => {
      expect(commandBus).toBeDefined();
    });
  });
});
