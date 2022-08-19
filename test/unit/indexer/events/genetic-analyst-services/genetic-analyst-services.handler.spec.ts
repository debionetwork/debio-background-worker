import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createObjectSearchGeneticAnalysts,
  ElasticSearchServiceProvider,
} from '../../../mock';
import {
  GeneticAnalystServicesCommandHandlers,
  GeneticAnalystServicesCreatedCommandIndexer,
  GeneticAnalystServicesDeletedCommandIndexer,
  GeneticAnalystServicesUpdatedCommandIndexer,
} from '../../../../../src/indexer/events/genetic-analyst-services';
import { GeneticAnalystServicesCreatedHandler } from '../../../../../src/indexer/events/genetic-analyst-services/commands/genetic-analyst-services-created/genetic-analyst-services-created.handler';
import { GeneticAnalystServicesDeletedHandler } from '../../../../../src/indexer/events/genetic-analyst-services/commands/genetic-analyst-services-deleted/genetic-analyst-services-deleted.handler';
import { GeneticAnalystServicesUpdatedHandler } from '../../../../../src/indexer/events/genetic-analyst-services/commands/genetic-analyst-services-updated/genetic-analyst-services-updated.handler';
import { when } from 'jest-when';

import { BlockMetaData } from '../../../../../src/indexer/models/block-meta-data';

describe('Genetic Anlaysts Services Substrate Event Handler', () => {
  let elasticsearchService: ElasticsearchService;

  let geneticAnalystsServicesCreatedHandler: GeneticAnalystServicesCreatedHandler;
  let geneticAnalystsServicesDeletedHandler: GeneticAnalystServicesDeletedHandler;
  let geneticAnalystsServicesUpdatedHandler: GeneticAnalystServicesUpdatedHandler;

  const createMockGeneticAnalystsServices = () => {
    return {
      toHuman: jest.fn(() => ({
        id: 'string',
        ownerId: 'string',
        info: {
          name: 'string',
          pricesByCurrency: [],
          expectedDuration: {
            duration: 0,
            durationType: 'string',
          },
          description: 'string',
          testResultSample: 'string',
        },
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
      providers: [
        ElasticSearchServiceProvider,
        ...GeneticAnalystServicesCommandHandlers,
      ],
    }).compile();

    elasticsearchService = modules.get(ElasticsearchService);

    geneticAnalystsServicesCreatedHandler = modules.get(
      GeneticAnalystServicesCreatedHandler,
    );
    geneticAnalystsServicesDeletedHandler = modules.get(
      GeneticAnalystServicesDeletedHandler,
    );
    geneticAnalystsServicesUpdatedHandler = modules.get(
      GeneticAnalystServicesUpdatedHandler,
    );
  });

  describe('Genetic Analysts Services Created', () => {
    it('should Genetic create index Analysts Servicess', async () => {
      const GENETIC_ANALYSTS_SERVICES_PARAM =
        createMockGeneticAnalystsServices();

      const geneticAnalystsServicesCreatedCommand: GeneticAnalystServicesCreatedCommandIndexer =
        new GeneticAnalystServicesCreatedCommandIndexer(
          [GENETIC_ANALYSTS_SERVICES_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalystsServicesCreatedHandler.execute(
        geneticAnalystsServicesCreatedCommand,
      );

      expect(elasticsearchService.index).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysts Services Deleted', () => {
    it('should delete index Genetic Analysts Servicess', async () => {
      const GENETIC_ANALYSTS_SERVICES_PARAM =
        createMockGeneticAnalystsServices();

      const GENETIC_ANALYSTS_ID = 'string';
      const CALLED_WITH =
        createObjectSearchGeneticAnalysts(GENETIC_ANALYSTS_ID);

      const ES_RESULT = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  services: [],
                },
              },
            ],
          },
        },
      };

      when(elasticsearchService.search)
        .calledWith(CALLED_WITH)
        .mockReturnValue(ES_RESULT);

      const geneticAnalystsServicesDeletedCommand: GeneticAnalystServicesDeletedCommandIndexer =
        new GeneticAnalystServicesDeletedCommandIndexer(
          [GENETIC_ANALYSTS_SERVICES_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalystsServicesDeletedHandler.execute(
        geneticAnalystsServicesDeletedCommand,
      );

      expect(elasticsearchService.delete).toHaveBeenCalled();
      expect(elasticsearchService.search).toHaveBeenCalled();
      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysts Services Updated', () => {
    it('should update index Genetic Analysts Servicess', async () => {
      const GENETIC_ANALYSTS_SERVICES_PARAM =
        createMockGeneticAnalystsServices();

      const GENETIC_ANALYSTS_ID = 'string';
      const CALLED_WITH =
        createObjectSearchGeneticAnalysts(GENETIC_ANALYSTS_ID);

      const ES_RESULT = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  services: [],
                },
              },
            ],
          },
        },
      };

      when(elasticsearchService.search)
        .calledWith(CALLED_WITH)
        .mockReturnValue(ES_RESULT);

      const geneticAnalystsServicesUpdatedCommand: GeneticAnalystServicesUpdatedCommandIndexer =
        new GeneticAnalystServicesUpdatedCommandIndexer(
          [GENETIC_ANALYSTS_SERVICES_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalystsServicesUpdatedHandler.execute(
        geneticAnalystsServicesUpdatedCommand,
      );

      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });
});
