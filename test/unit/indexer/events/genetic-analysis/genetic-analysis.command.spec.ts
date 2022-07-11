import {
  GeneticAnalysisInProgressCommand,
  GeneticAnalysisRejectedCommand,
  GeneticAnalysisResultReadyCommand,
  GeneticAnalysisSubmittedCommand,
} from '../../../../../src/indexer/events/genetic-analysis';
import { BlockMetaData } from '../../../../../src/indexer/models/block-meta-data';
import { GeneticAnalysisModel } from '../../../../../src/indexer/models/genetic-analysis/genetic-analysis.model';

jest.mock(
  '../../../../../src/indexer/models/genetic-analysis/genetic-analysis.model',
);

describe('Genetic Analysis Substrate Event Command', () => {
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

  describe('Genetic Analysis In Progress Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSIS_PARAM = createMockGeneticAnalysis();

      /* eslint-disable */
      const _geneticAnalysisInProgress: GeneticAnalysisInProgressCommand =
        new GeneticAnalysisInProgressCommand(
          [GENETIC_ANALYSIS_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalysisModel).toHaveBeenCalled();
      expect(GeneticAnalysisModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalysisInProgress: GeneticAnalysisInProgressCommand =
          new GeneticAnalysisInProgressCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysis Rejected Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSIS_PARAM = createMockGeneticAnalysis();

      /* eslint-disable */
      const _geneticAnalysisRejected: GeneticAnalysisRejectedCommand =
        new GeneticAnalysisRejectedCommand(
          [GENETIC_ANALYSIS_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalysisModel).toHaveBeenCalled();
      expect(GeneticAnalysisModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalysisRejected: GeneticAnalysisRejectedCommand =
          new GeneticAnalysisRejectedCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysis Result Ready Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSIS_PARAM = createMockGeneticAnalysis();

      /* eslint-disable */
      const _geneticAnalysisResultReady: GeneticAnalysisResultReadyCommand =
        new GeneticAnalysisResultReadyCommand(
          [GENETIC_ANALYSIS_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalysisModel).toHaveBeenCalled();
      expect(GeneticAnalysisModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalysisResultReady: GeneticAnalysisResultReadyCommand =
          new GeneticAnalysisResultReadyCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysis Submitted Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSIS_PARAM = createMockGeneticAnalysis();

      /* eslint-disable */
      const _geneticAnalysisSubmitted: GeneticAnalysisSubmittedCommand =
        new GeneticAnalysisSubmittedCommand(
          [GENETIC_ANALYSIS_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalysisModel).toHaveBeenCalled();
      expect(GeneticAnalysisModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalysisSubmitted: GeneticAnalysisSubmittedCommand =
          new GeneticAnalysisSubmittedCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });
});
