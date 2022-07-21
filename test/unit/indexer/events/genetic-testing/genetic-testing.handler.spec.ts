import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { BlockMetaData } from '../../../../../src/indexer/models/block-meta-data';
import { DataStakedHandler } from '../../../../../src/indexer/events/genetic-testing/commands/data-staked/data-staked.handler';
import {
  DataStakedCommandIndexer,
  GeneticTestingCommandHandlers,
} from '../../../../../src/indexer/events/genetic-testing';
import { ElasticSearchServiceProvider } from '../../../mock';

let dataStakedHandler: DataStakedHandler;

let elasticsearchService: ElasticsearchService;

describe('Genetic Testing Substrate Event Handler', () => {
  const createMockDataStaked = () => {
    return ['string', 'string', 'string'];
  };

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: '',
      blockNumber: 1,
    };
  }

  beforeAll(async () => {
    const modules: TestingModule = await Test.createTestingModule({
      providers: [
        ElasticSearchServiceProvider,
        ...GeneticTestingCommandHandlers,
      ],
    }).compile();

    dataStakedHandler = modules.get<DataStakedHandler>(DataStakedHandler);

    elasticsearchService =
      modules.get<ElasticsearchService>(ElasticsearchService);

    await modules.init();
  });

  describe('Data Staked Event', () => {
    it('Data Staked Handler', async () => {
      const staked = createMockDataStaked();

      const dataStakedCommand: DataStakedCommandIndexer =
        new DataStakedCommandIndexer(staked, mockBlockNumber());

      await dataStakedHandler.execute(dataStakedCommand);
      expect(elasticsearchService.update).toHaveBeenCalled();
      expect(elasticsearchService.index).toHaveBeenCalled();
    });
  });
});
