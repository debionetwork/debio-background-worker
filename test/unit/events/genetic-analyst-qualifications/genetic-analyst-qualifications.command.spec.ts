import {
  GeneticAnalystsQualificationCreatedCommand,
  GeneticAnalystsQualificationDeletedCommand,
  GeneticAnalystsQualificationUpdatedCommand,
} from '../../../../src/substrate/events/genetic-analyst-qualifications';
import { BlockMetaData } from '../../../../src/substrate/models/blockMetaData';
import { GeneticAnalystsQualificationModel } from '../../../../src/substrate/models/genetic-analysts-qualifications/genetic-analysts-qualifications.model';

jest.mock(
  '../../../../src/substrate/models/genetic-analysts-qualifications/genetic-analysts-qualifications.model',
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

      const _geneticAnalystsQualificationsCreated: GeneticAnalystsQualificationCreatedCommand =
        new GeneticAnalystsQualificationCreatedCommand(
          [GENETIC_ANALYSTS_QUALIFICATIONS_PARAM],
          mockBlockNumber(),
        );
      expect(GeneticAnalystsQualificationModel).toHaveBeenCalled();
      expect(GeneticAnalystsQualificationModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_QUALIFICATIONS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_QUALIFICATIONS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalystsQualificationsCreated: GeneticAnalystsQualificationCreatedCommand =
          new GeneticAnalystsQualificationCreatedCommand(
            [{}],
            mockBlockNumber(),
          );
      }).toThrowError();
    });
  });

  describe('Genetic Analysts Qualification Updated Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_QUALIFICATIONS_PARAM =
        createMockGeneticAnalystsQualifications();

      const _geneticAnalystsQualificationsUpdated: GeneticAnalystsQualificationUpdatedCommand =
        new GeneticAnalystsQualificationUpdatedCommand(
          [GENETIC_ANALYSTS_QUALIFICATIONS_PARAM],
          mockBlockNumber(),
        );
      expect(GeneticAnalystsQualificationModel).toHaveBeenCalled();
      expect(GeneticAnalystsQualificationModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_QUALIFICATIONS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_QUALIFICATIONS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalystsQualificationsUpdated: GeneticAnalystsQualificationUpdatedCommand =
          new GeneticAnalystsQualificationUpdatedCommand(
            [{}],
            mockBlockNumber(),
          );
      }).toThrowError();
    });
  });

  describe('Genetic Analysts Qualification Deleted Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_QUALIFICATIONS_PARAM =
        createMockGeneticAnalystsQualifications();

      const _geneticAnalystsQualificationsDeleted: GeneticAnalystsQualificationDeletedCommand =
        new GeneticAnalystsQualificationDeletedCommand(
          [GENETIC_ANALYSTS_QUALIFICATIONS_PARAM],
          mockBlockNumber(),
        );
      expect(GeneticAnalystsQualificationModel).toHaveBeenCalled();
      expect(GeneticAnalystsQualificationModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_QUALIFICATIONS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_QUALIFICATIONS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalystsQualificationsDeleted: GeneticAnalystsQualificationDeletedCommand =
          new GeneticAnalystsQualificationDeletedCommand(
            [{}],
            mockBlockNumber(),
          );
      }).toThrowError();
    });
  });
});
