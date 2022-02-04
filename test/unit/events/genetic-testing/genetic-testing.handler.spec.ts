import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { BlockMetaData } from '../../../../src/substrate/models/blockMetaData';
import { DataStakedHandler } from '../../../../src/substrate/events/genetic-testing/commands/data-staked/data-staked.handler';
import {
  DataStakedCommand,
  GeneticTestingCommandHandlers,
} from '../../../../src/substrate/events/genetic-testing';
import { ElasticSearchServiceProvider } from '../../mock';

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

      const dataStakedCommand: DataStakedCommand = new DataStakedCommand(
        staked,
        mockBlockNumber(),
      );

      await dataStakedHandler.execute(dataStakedCommand);
      expect(elasticsearchService.update).toHaveBeenCalled();
      expect(elasticsearchService.index).toHaveBeenCalled();
    });
  });
});
