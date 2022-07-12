import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AddGeneticDataCommand,
  GeneticDataCommandHandlers,
  RemoveGeneticDataCommand,
  UpdateGeneticDataCommand,
} from '../../../../../src/indexer/events/genetic-data';
import { ElasticSearchServiceProvider } from '../../../mock';
import { AddGeneticDataHandler } from '../../../../../src/indexer/events/genetic-data/commands/add-genetic-data/add-genetic-data.handler';
import { RemoveGeneticDataHandler } from '../../../../../src/indexer/events/genetic-data/commands/remove-genetic-data/remove-genetic-data.handler';
import { UpdateGeneticDataHandler } from '../../../../../src/indexer/events/genetic-data/commands/update-genetic-data/update-genetic-data.handler';
import { BlockMetaData } from '../../../../../src/indexer/models/block-meta-data';

describe('Genetic Data Substate Event Handler', () => {
  let elasticsearchService: ElasticsearchService;

  let addGeneticDataHandler: AddGeneticDataHandler;
  let removeGeneticDataHandler: RemoveGeneticDataHandler;
  let updateGeneticDataHandler: UpdateGeneticDataHandler;

  const createMockGeneticData = () => {
    return {
      toHuman: jest.fn(() => ({
        id: 'string',
        ownerId: 'string',
        title: 'string',
        description: 'string',
        reportLink: 'string',
        supportingDocument: 'string',
      })),
    };
  };

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: '',
      blockNumber: 1,
    };
  }

  beforeEach(async () => {
    const modules: TestingModule = await Test.createTestingModule({
      providers: [ElasticSearchServiceProvider, ...GeneticDataCommandHandlers],
    }).compile();

    elasticsearchService = modules.get(ElasticsearchService);

    addGeneticDataHandler = modules.get(AddGeneticDataHandler);
    removeGeneticDataHandler = modules.get(RemoveGeneticDataHandler);
    updateGeneticDataHandler = modules.get(UpdateGeneticDataHandler);

    await modules.init();
  });

  describe('Add Genetic Data Handler', () => {
    it('create index genetic data', async () => {
      const GENETIC_DATA_PARAM = createMockGeneticData();

      const addGeneticDataCommand: AddGeneticDataCommand =
        new AddGeneticDataCommand([GENETIC_DATA_PARAM], mockBlockNumber());

      await addGeneticDataHandler.execute(addGeneticDataCommand);

      expect(elasticsearchService.index).toHaveBeenCalled();
    });
  });

  describe('Remove Genetic Data Handler', () => {
    it('delete index genetic data', async () => {
      const GENETIC_DATA_PARAM = createMockGeneticData();

      const removeGeneticDataCommand: RemoveGeneticDataCommand =
        new RemoveGeneticDataCommand([GENETIC_DATA_PARAM], mockBlockNumber());

      await removeGeneticDataHandler.execute(removeGeneticDataCommand);

      expect(elasticsearchService.delete).toHaveBeenCalled();
    });
  });

  describe('Update Genetic Data Handler', () => {
    it('update index genetic data', async () => {
      const GENETIC_DATA_PARAM = createMockGeneticData();

      const updateGeneticDataCommand: UpdateGeneticDataCommand =
        new UpdateGeneticDataCommand([GENETIC_DATA_PARAM], mockBlockNumber());

      await updateGeneticDataHandler.execute(updateGeneticDataCommand);

      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });
});
