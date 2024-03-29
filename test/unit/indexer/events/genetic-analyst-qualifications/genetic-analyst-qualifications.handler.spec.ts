import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createObjectSearchGeneticAnalysts,
  ElasticSearchServiceProvider,
} from '../../../mock';
import {
  GeneticAnalystQualificationsCommandHandlers,
  GeneticAnalystsQualificationCreatedCommandIndexer,
  GeneticAnalystsQualificationDeletedCommandIndexer,
  GeneticAnalystsQualificationUpdatedCommandIndexer,
} from '@indexer/events/genetic-analyst-qualifications';
import { GeneticAnalystsQualificationCreatedHandler } from '@indexer/events/genetic-analyst-qualifications/commands/genetic-analysts-qualification-created/genetic-analysts-qualification-created.handler';
import { GeneticAnalystsQualificationDeletedHandler } from '@indexer/events/genetic-analyst-qualifications/commands/genetic-analysts-qualification-deleted/genetic-analysts-qualification-deleted.handler';
import { GeneticAnalystsQualificationUpdatedHandler } from '@indexer/events/genetic-analyst-qualifications/commands/genetic-analysts-qualification-updated/genetic-analysts-qualification-updated.handler';
import { when } from 'jest-when';

import { BlockMetaData } from '@indexer/models/block-meta-data';

describe('Genetic Anlaysts Qualificatioins Substrate Event Handler', () => {
  let elasticsearchService: ElasticsearchService;

  let geneticAnalystsQualificationCreatedHandler: GeneticAnalystsQualificationCreatedHandler;
  let geneticAnalystsQualificationDeletedHandler: GeneticAnalystsQualificationDeletedHandler;
  let geneticAnalystsQualificationUpdatedHandler: GeneticAnalystsQualificationUpdatedHandler;

  const createMockGeneticAnalystsQualifications = () => {
    return {
      toHuman: jest.fn(() => ({
        id: 'string',
        ownerId: 'string',
        info: {
          experience: [],
          certification: [],
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
        ...GeneticAnalystQualificationsCommandHandlers,
      ],
    }).compile();

    elasticsearchService = modules.get(ElasticsearchService);

    geneticAnalystsQualificationCreatedHandler = modules.get(
      GeneticAnalystsQualificationCreatedHandler,
    );
    geneticAnalystsQualificationDeletedHandler = modules.get(
      GeneticAnalystsQualificationDeletedHandler,
    );
    geneticAnalystsQualificationUpdatedHandler = modules.get(
      GeneticAnalystsQualificationUpdatedHandler,
    );
  });

  describe('Genetic Analysts Qualification Created', () => {
    it('should Genetic create index Analysts Qualifications', async () => {
      const GENETIC_ANALYSTS_QUALIFICATIONS_PARAM =
        createMockGeneticAnalystsQualifications();

      const geneticAnalystsQualificationCreatedCommand: GeneticAnalystsQualificationCreatedCommandIndexer =
        new GeneticAnalystsQualificationCreatedCommandIndexer(
          [GENETIC_ANALYSTS_QUALIFICATIONS_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalystsQualificationCreatedHandler.execute(
        geneticAnalystsQualificationCreatedCommand,
      );

      expect(elasticsearchService.index).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysts Qualification Deleted', () => {
    it('should delete index Genetic Analysts Qualifications', async () => {
      const GENETIC_ANALYSTS_QUALIFICATIONS_PARAM =
        createMockGeneticAnalystsQualifications();

      const GENETIC_ANALYSTS_ID = 'string';
      const CALLED_WITH =
        createObjectSearchGeneticAnalysts(GENETIC_ANALYSTS_ID);

      const ES_RESULT = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  qualifications: [],
                },
              },
            ],
          },
        },
      };

      when(elasticsearchService.search)
        .calledWith(CALLED_WITH)
        .mockReturnValue(ES_RESULT);

      const geneticAnalystsQualificationDeletedCommand: GeneticAnalystsQualificationDeletedCommandIndexer =
        new GeneticAnalystsQualificationDeletedCommandIndexer(
          [GENETIC_ANALYSTS_QUALIFICATIONS_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalystsQualificationDeletedHandler.execute(
        geneticAnalystsQualificationDeletedCommand,
      );

      expect(elasticsearchService.delete).toHaveBeenCalled();
      expect(elasticsearchService.search).toHaveBeenCalled();
      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysts Qualification Updated', () => {
    it('should update index Genetic Analysts Qualifications', async () => {
      const GENETIC_ANALYSTS_QUALIFICATIONS_PARAM =
        createMockGeneticAnalystsQualifications();

      const GENETIC_ANALYSTS_ID = 'string';
      const CALLED_WITH =
        createObjectSearchGeneticAnalysts(GENETIC_ANALYSTS_ID);

      const ES_RESULT = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  qualifications: [],
                },
              },
            ],
          },
        },
      };

      when(elasticsearchService.search)
        .calledWith(CALLED_WITH)
        .mockReturnValue(ES_RESULT);

      const geneticAnalystsQualificationUpdatedCommand: GeneticAnalystsQualificationUpdatedCommandIndexer =
        new GeneticAnalystsQualificationUpdatedCommandIndexer(
          [GENETIC_ANALYSTS_QUALIFICATIONS_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalystsQualificationUpdatedHandler.execute(
        geneticAnalystsQualificationUpdatedCommand,
      );

      expect(elasticsearchService.update).toHaveBeenCalled();
      expect(elasticsearchService.search).toHaveBeenCalled();
    });
  });
});
