import {
  GeneticAnalystsQualificationCreatedCommandIndexer,
  GeneticAnalystsQualificationDeletedCommandIndexer,
  GeneticAnalystsQualificationUpdatedCommandIndexer,
} from '@indexer/events/genetic-analyst-qualifications';
import { BlockMetaData } from '@indexer/models/block-meta-data';
import { GeneticAnalystsQualificationModel } from '@indexer/models/genetic-analysts-qualifications/genetic-analysts-qualifications.model';

jest.mock(
  '@indexer/models/genetic-analysts-qualifications/genetic-analysts-qualifications.model',
);

describe('Genetic Analysts Qualifications Substrate Event Handler', () => {
  const createMockGeneticAnalystsQualifications = () => {
    return {
      toHuman: jest.fn(() => ({
        id: 'string',
        ownerId: 'string',
        info: {},
      })),
    };
  };

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: '',
      blockNumber: 1,
    };
  }

  describe('Genetic Analysts Qualification Created Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_QUALIFICATIONS_PARAM =
        createMockGeneticAnalystsQualifications();

      /* eslint-disable */
      const _geneticAnalystsQualificationsCreated: GeneticAnalystsQualificationCreatedCommandIndexer =
        new GeneticAnalystsQualificationCreatedCommandIndexer(
          [GENETIC_ANALYSTS_QUALIFICATIONS_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalystsQualificationModel).toHaveBeenCalled();
      expect(GeneticAnalystsQualificationModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_QUALIFICATIONS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_QUALIFICATIONS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalystsQualificationsCreated: GeneticAnalystsQualificationCreatedCommandIndexer =
          new GeneticAnalystsQualificationCreatedCommandIndexer(
            [{}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts Qualification Updated Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_QUALIFICATIONS_PARAM =
        createMockGeneticAnalystsQualifications();

      /* eslint-disable */
      const _geneticAnalystsQualificationsUpdated: GeneticAnalystsQualificationUpdatedCommandIndexer =
        new GeneticAnalystsQualificationUpdatedCommandIndexer(
          [GENETIC_ANALYSTS_QUALIFICATIONS_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalystsQualificationModel).toHaveBeenCalled();
      expect(GeneticAnalystsQualificationModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_QUALIFICATIONS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_QUALIFICATIONS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalystsQualificationsUpdated: GeneticAnalystsQualificationUpdatedCommandIndexer =
          new GeneticAnalystsQualificationUpdatedCommandIndexer(
            [{}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts Qualification Deleted Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_QUALIFICATIONS_PARAM =
        createMockGeneticAnalystsQualifications();

      /* eslint-disable */
      const _geneticAnalystsQualificationsDeleted: GeneticAnalystsQualificationDeletedCommandIndexer =
        new GeneticAnalystsQualificationDeletedCommandIndexer(
          [GENETIC_ANALYSTS_QUALIFICATIONS_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalystsQualificationModel).toHaveBeenCalled();
      expect(GeneticAnalystsQualificationModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_QUALIFICATIONS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_QUALIFICATIONS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalystsQualificationsDeleted: GeneticAnalystsQualificationDeletedCommandIndexer =
          new GeneticAnalystsQualificationDeletedCommandIndexer(
            [{}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrowError();
    });
  });
});
