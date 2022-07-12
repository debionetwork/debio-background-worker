import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { IndexerHandler } from '../../../src/indexer/indexer.handler';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ServiceCommandHandlers } from '../../../src/indexer/events/services';
import { LabCommandHandlers } from '../../../src/indexer/events/labs';
import { OrderCommandHandlers } from '../../../src/indexer/events/orders';
import {
  CommandBusProvider,
  ElasticSearchServiceProvider,
  indexerHandlerProvider,
} from '../mock';

describe('Indexer Handler', () => {
  let indexerHandler: IndexerHandler;
  let commandBus: CommandBus;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElasticsearchService,
        ElasticSearchServiceProvider,
        IndexerHandler,
        indexerHandlerProvider,
        CommandBus,
        CommandBusProvider,
        ...LabCommandHandlers,
        ...ServiceCommandHandlers,
        ...OrderCommandHandlers,
      ],
    }).compile();

    indexerHandler = module.get<IndexerHandler>(IndexerHandler);
    commandBus = module.get<CommandBus>(CommandBus);

    await module.init();
  });

  describe('Indexer', () => {
    it('Indexer Handler must defined', () => {
      expect(indexerHandler).toBeDefined();
    });

    it('CommandBus must defined', () => {
      expect(commandBus).toBeDefined();
    });
  });
});
