import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import {
  GeneticAnalysisCommandHandlers,
  GeneticAnalysisInProgressCommand,
  GeneticAnalysisRejectedCommand,
  GeneticAnalysisResultReadyCommand,
  GeneticAnalysisSubmittedCommand,
} from '../../../../src/substrate/events/genetic-analysis';
import { BlockMetaData } from '../../../../src/substrate/models/blockMetaData';
import { ElasticSearchServiceProvider } from '../../mock';

import { GeneticAnalysisInProgressHandler } from '../../../../src/substrate/events/genetic-analysis/commands/genetic-analysis-in-progress/genetic-analysis-in-progress.handler';
import { GeneticAnalysisRejectedHandler } from '../../../../src/substrate/events/genetic-analysis/commands/genetic-analysis-rejected/genetic-analysis-rejected.handler';
import { GeneticAnalysisResultReadyHandler } from '../../../../src/substrate/events/genetic-analysis/commands/genetic-analysis-result-ready/genetic-analysis-result-ready.handler';
import { GeneticAnalysisSubmittedHandler } from '../../../../src/substrate/events/genetic-analysis/commands/genetic-analysis-submitted/genetic-analysis-submitted.handler';

describe('Genetic Analysis Substrate Event Handler', () => {
  let elasticsearchService: ElasticsearchService;

  let geneticAnalysisInProgressHandler: GeneticAnalysisInProgressHandler;
  let geneticAnalysisRejectedHandler: GeneticAnalysisRejectedHandler;
  let geneticAnalysisResultReadyHandler: GeneticAnalysisResultReadyHandler;
  let geneticAnalysisSubmittedHandler: GeneticAnalysisSubmittedHandler;

  const createMockGeneticAnalysis = () => {
    return {
      toHuman: jest.fn(() => ({
        geneticAnalystTrackingId: 'string',
        geneticAnalystId: 'string',
        ownerId: 'string',
        reportLink: 'string',
        comment: 'string',
        rejectedTitle: 'string',
        rejectedDescription: 'string',
        geneticAnalystOrderId: 'string',
        createdAt: '0',
        updatedAt: '0',
        status: 'string',
      })),
    };
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
        ...GeneticAnalysisCommandHandlers,
      ],
    }).compile();

    elasticsearchService = modules.get(ElasticsearchService);
    geneticAnalysisInProgressHandler = modules.get(
      GeneticAnalysisInProgressHandler,
    );
    geneticAnalysisRejectedHandler = modules.get(
      GeneticAnalysisRejectedHandler,
    );
    geneticAnalysisResultReadyHandler = modules.get(
      GeneticAnalysisResultReadyHandler,
    );
    geneticAnalysisSubmittedHandler = modules.get(
      GeneticAnalysisSubmittedHandler,
    );

    await modules.init();
  });

  describe('Genetic Analysis In Progress Handler', () => {
    it('should update genetic analysis to in progress', async () => {
      const GENETIC_ANALYSIS_PARAM = createMockGeneticAnalysis();

      const geneticAnalysisInProgressCommand: GeneticAnalysisInProgressCommand =
        new GeneticAnalysisInProgressCommand(
          [GENETIC_ANALYSIS_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalysisInProgressHandler.execute(
        geneticAnalysisInProgressCommand,
      );
      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysis Rejected Handler', () => {
    it('should update genetic analysis status to rejected', async () => {
      const GENETIC_ANALYSIS_PARAM = createMockGeneticAnalysis();

      const geneticAnalysisRejectedCommand: GeneticAnalysisRejectedCommand =
        new GeneticAnalysisRejectedCommand(
          [GENETIC_ANALYSIS_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalysisRejectedHandler.execute(
        geneticAnalysisRejectedCommand,
      );
      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysis Result Ready Handler', () => {
    it('should update genetic analysis status to result ready', async () => {
      const GENETIC_ANALYSIS_PARAM = createMockGeneticAnalysis();

      const geneticAnalysisResultReadyCommand: GeneticAnalysisResultReadyCommand =
        new GeneticAnalysisResultReadyCommand(
          [GENETIC_ANALYSIS_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalysisResultReadyHandler.execute(
        geneticAnalysisResultReadyCommand,
      );
      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysis Submitted Handler', () => {
    it('should insert genetic analysis', async () => {
      const GENETIC_ANALYSIS_PARAM = createMockGeneticAnalysis();

      const geneticAnalysisSubmittedCommand: GeneticAnalysisSubmittedCommand =
        new GeneticAnalysisSubmittedCommand(
          [GENETIC_ANALYSIS_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalysisSubmittedHandler.execute(
        geneticAnalysisSubmittedCommand,
      );
      expect(elasticsearchService.index).toHaveBeenCalled();
    });
  });
});
