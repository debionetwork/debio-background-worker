import {
  GeneticAnalystsDeletedCommand,
  GeneticAnalystsRegisteredCommand,
  GeneticAnalystsStakeSuccessfulCommand,
  GeneticAnalystsUpdateVerificationStatusCommand,
  GeneticAnalystsUpdatedCommand,
  GeneticAnalystsUpdateAvailabilityStatusCommand,
} from '../../../../src/substrate/events/genetic-analysts';
import { BlockMetaData } from '../../../../src/substrate/models/blockMetaData';
import { GeneticAnalystsModel } from '../../../../src/substrate/models/genetic-analysts/genetic-analysts.model';

jest.mock(
  '../../../../src/substrate/models/genetic-analysts/genetic-analysts.model',
);

describe('Genetic Analysts Substrate Event Handler', () => {
  const createMockGeneticAnalysts = () => {
    return {
      toHuman: jest.fn(() => ({
        accountId: 'string',
        services: [],
        qualifications: [],
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

  describe('Genetic Analysts Registered Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      const _geneticAnalystsRegistered: GeneticAnalystsRegisteredCommand =
        new GeneticAnalystsRegisteredCommand(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );
      expect(GeneticAnalystsModel).toHaveBeenCalled();
      expect(GeneticAnalystsModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalystsRegistered: GeneticAnalystsRegisteredCommand =
          new GeneticAnalystsRegisteredCommand([{}], mockBlockNumber());
      }).toThrowError();
    });
  });

  describe('Genetic Analysts Stake Successful', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      const _geneticAnalystsStakeSuccessful: GeneticAnalystsStakeSuccessfulCommand =
        new GeneticAnalystsStakeSuccessfulCommand(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );
      expect(GeneticAnalystsModel).toHaveBeenCalled();
      expect(GeneticAnalystsModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalystsStakeSuccessful: GeneticAnalystsStakeSuccessfulCommand =
          new GeneticAnalystsStakeSuccessfulCommand([{}], mockBlockNumber());
      }).toThrowError();
    });
  });

  describe('Genetic Analysts update verification status', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      const _geneticAnalystsUpdateVerificationStatus: GeneticAnalystsUpdateVerificationStatusCommand =
        new GeneticAnalystsUpdateVerificationStatusCommand(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );

      expect(GeneticAnalystsModel).toHaveBeenCalled();
      expect(GeneticAnalystsModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalystsUpdateVerificationStatus: GeneticAnalystsUpdateVerificationStatusCommand =
          new GeneticAnalystsUpdateVerificationStatusCommand(
            [{}],
            mockBlockNumber(),
          );
      }).toThrowError();
    });
  });

  describe('Genetic Analysts Updated Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      const _geneticAnalystsUpdated: GeneticAnalystsUpdatedCommand =
        new GeneticAnalystsUpdatedCommand(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );
      expect(GeneticAnalystsModel).toHaveBeenCalled();
      expect(GeneticAnalystsModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalystsUpdated: GeneticAnalystsUpdatedCommand =
          new GeneticAnalystsUpdatedCommand([{}], mockBlockNumber());
      }).toThrowError();
    });
  });

  describe('Genetic Analysts Deleted Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      const _geneticAnalystsDeleted: GeneticAnalystsDeletedCommand =
        new GeneticAnalystsDeletedCommand(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );
      expect(GeneticAnalystsModel).toHaveBeenCalled();
      expect(GeneticAnalystsModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalystsDeleted: GeneticAnalystsDeletedCommand =
          new GeneticAnalystsDeletedCommand([{}], mockBlockNumber());
      }).toThrowError();
    });
  });

  describe('Genetic Analysts update availability status Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      const _geneticAnalystsUpdateAvailabilityStatus: GeneticAnalystsUpdateAvailabilityStatusCommand =
        new GeneticAnalystsUpdateAvailabilityStatusCommand(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );
      expect(GeneticAnalystsModel).toHaveBeenCalled();
      expect(GeneticAnalystsModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalystsUpdateAvailabilityStatus: GeneticAnalystsUpdateAvailabilityStatusCommand =
          new GeneticAnalystsUpdateAvailabilityStatusCommand([{}], mockBlockNumber());
      }).toThrowError();
    });
  });
});
