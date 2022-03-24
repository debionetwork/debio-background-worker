import {
  GeneticAnalysisInProgressCommand,
  GeneticAnalysisRejectedCommand,
  GeneticAnalysisResultReadyCommand,
  GeneticAnalysisSubmittedCommand,
} from '../../../../src/substrate/events/genetic-analysis';
import { BlockMetaData } from '../../../../src/substrate/models/blockMetaData';
import { GeneticAnalysisModel } from '../../../../src/substrate/models/genetic-analysis/genetic-analysis.model';

jest.mock(
  '../../../../src/substrate/models/genetic-analysis/genetic-analysis.model',
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

      const _geneticAnalysisInProgress: GeneticAnalysisInProgressCommand =
        new GeneticAnalysisInProgressCommand(
          [GENETIC_ANALYSIS_PARAM],
          mockBlockNumber(),
        ); // eslint-disable-line
      expect(GeneticAnalysisModel).toHaveBeenCalled();
      expect(GeneticAnalysisModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalysisInProgress: GeneticAnalysisInProgressCommand =
          new GeneticAnalysisInProgressCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });

  describe('Genetic Analysis Rejected Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSIS_PARAM = createMockGeneticAnalysis();

      const _geneticAnalysisRejected: GeneticAnalysisRejectedCommand =
        new GeneticAnalysisRejectedCommand(
          [GENETIC_ANALYSIS_PARAM],
          mockBlockNumber(),
        ); // eslint-disable-line
      expect(GeneticAnalysisModel).toHaveBeenCalled();
      expect(GeneticAnalysisModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalysisRejected: GeneticAnalysisRejectedCommand =
          new GeneticAnalysisRejectedCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });

  describe('Genetic Analysis Result Ready Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSIS_PARAM = createMockGeneticAnalysis();

      const _geneticAnalysisResultReady: GeneticAnalysisResultReadyCommand =
        new GeneticAnalysisResultReadyCommand(
          [GENETIC_ANALYSIS_PARAM],
          mockBlockNumber(),
        ); // eslint-disable-line
      expect(GeneticAnalysisModel).toHaveBeenCalled();
      expect(GeneticAnalysisModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalysisResultReady: GeneticAnalysisResultReadyCommand =
          new GeneticAnalysisResultReadyCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });

  describe('Genetic Analysis Submitted Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSIS_PARAM = createMockGeneticAnalysis();

      const _geneticAnalysisSubmitted: GeneticAnalysisSubmittedCommand =
        new GeneticAnalysisSubmittedCommand(
          [GENETIC_ANALYSIS_PARAM],
          mockBlockNumber(),
        ); // eslint-disable-line
      expect(GeneticAnalysisModel).toHaveBeenCalled();
      expect(GeneticAnalysisModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalysisSubmitted: GeneticAnalysisSubmittedCommand =
          new GeneticAnalysisSubmittedCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });
});
