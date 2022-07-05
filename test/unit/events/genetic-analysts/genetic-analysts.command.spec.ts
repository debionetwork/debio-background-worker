import {
  GeneticAnalystsDeletedCommand,
  GeneticAnalystsRegisteredCommand,
  GeneticAnalystsStakeSuccessfulCommand,
  GeneticAnalystsUpdateVerificationStatusCommand,
  GeneticAnalystsUpdatedCommand,
  GeneticAnalystsUpdateAvailabilityStatusCommand,
  GeneticAnalystsRetrieveUnstakeAmountCommand,
  GeneticAnalystVerificationFailedCommand,
  GeneticAnalystUnstakeSuccessfulCommand,
} from '../../../../src/indexer/events/genetic-analysts';
import { BlockMetaData } from '../../../../src/indexer/models/blockMetaData';
import { GeneticAnalystsModel } from '../../../../src/indexer/models/genetic-analysts/genetic-analysts.model';

jest.mock(
  '../../../../src/indexer/models/genetic-analysts/genetic-analysts.model',
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

      /* eslint-disable */
      const _geneticAnalystsRegistered: GeneticAnalystsRegisteredCommand =
        new GeneticAnalystsRegisteredCommand(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalystsModel).toHaveBeenCalled();
      expect(GeneticAnalystsModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalystsRegistered: GeneticAnalystsRegisteredCommand =
          new GeneticAnalystsRegisteredCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts Stake Successful', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      /* eslint-disable */
      const _geneticAnalystsStakeSuccessful: GeneticAnalystsStakeSuccessfulCommand =
        new GeneticAnalystsStakeSuccessfulCommand(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalystsModel).toHaveBeenCalled();
      expect(GeneticAnalystsModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalystsStakeSuccessful: GeneticAnalystsStakeSuccessfulCommand =
          new GeneticAnalystsStakeSuccessfulCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts update verification status', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      /* eslint-disable */
      const _geneticAnalystsUpdateVerificationStatus: GeneticAnalystsUpdateVerificationStatusCommand =
        new GeneticAnalystsUpdateVerificationStatusCommand(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalystsModel).toHaveBeenCalled();
      expect(GeneticAnalystsModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalystsUpdateVerificationStatus: GeneticAnalystsUpdateVerificationStatusCommand =
          new GeneticAnalystsUpdateVerificationStatusCommand(
            [{}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts Updated Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      /* eslint-disable */
      const _geneticAnalystsUpdated: GeneticAnalystsUpdatedCommand =
        new GeneticAnalystsUpdatedCommand(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalystsModel).toHaveBeenCalled();
      expect(GeneticAnalystsModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalystsUpdated: GeneticAnalystsUpdatedCommand =
          new GeneticAnalystsUpdatedCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts Deleted Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      /* eslint-disable */
      const _geneticAnalystsDeleted: GeneticAnalystsDeletedCommand =
        new GeneticAnalystsDeletedCommand(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalystsModel).toHaveBeenCalled();
      expect(GeneticAnalystsModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalystsDeleted: GeneticAnalystsDeletedCommand =
          new GeneticAnalystsDeletedCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts update availability status Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      /* eslint-disable */
      const _geneticAnalystsUpdateAvailabilityStatus: GeneticAnalystsUpdateAvailabilityStatusCommand =
        new GeneticAnalystsUpdateAvailabilityStatusCommand(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalystsModel).toHaveBeenCalled();
      expect(GeneticAnalystsModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalystsUpdateAvailabilityStatus: GeneticAnalystsUpdateAvailabilityStatusCommand =
          new GeneticAnalystsUpdateAvailabilityStatusCommand(
            [{}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts retrieve unstake amount Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      /* eslint-disable */
      const _geneticAnalystsRetrieveUnstakeAmount: GeneticAnalystsRetrieveUnstakeAmountCommand =
        new GeneticAnalystsRetrieveUnstakeAmountCommand(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalystsModel).toHaveBeenCalled();
      expect(GeneticAnalystsModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalystsRetrieveUnstakeAmount: GeneticAnalystsRetrieveUnstakeAmountCommand =
          new GeneticAnalystsRetrieveUnstakeAmountCommand(
            [{}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts unstake successful Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      /* eslint-disable */
      const _geneticAnalystsUnstakeSuccessful: GeneticAnalystUnstakeSuccessfulCommand =
        new GeneticAnalystUnstakeSuccessfulCommand(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalystsModel).toHaveBeenCalled();
      expect(GeneticAnalystsModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalystsUnstakeSuccessful: GeneticAnalystUnstakeSuccessfulCommand =
          new GeneticAnalystUnstakeSuccessfulCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts verification failed Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      /* eslint-disable */
      const _geneticAnalystsVerificationFailed: GeneticAnalystVerificationFailedCommand =
        new GeneticAnalystVerificationFailedCommand(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalystsModel).toHaveBeenCalled();
      expect(GeneticAnalystsModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalystsVerificationFailed: GeneticAnalystVerificationFailedCommand =
          new GeneticAnalystVerificationFailedCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });
});
