import {
  GeneticAnalystsDeletedCommandIndexer,
  GeneticAnalystsRegisteredCommandIndexer,
  GeneticAnalystsStakeSuccessfulCommandIndexer,
  GeneticAnalystsUpdateVerificationStatusCommandIndexer,
  GeneticAnalystsUpdatedCommandIndexer,
  GeneticAnalystsUpdateAvailabilityStatusCommandIndexer,
  GeneticAnalystsRetrieveUnstakeAmountCommandIndexer,
  GeneticAnalystVerificationFailedCommandIndexer,
  GeneticAnalystUnstakeSuccessfulCommandIndexer,
} from '../../../../../src/indexer/events/genetic-analysts';
import { BlockMetaData } from '../../../../../src/indexer/models/block-meta-data';
import { GeneticAnalystsModel } from '../../../../../src/indexer/models/genetic-analysts/genetic-analysts.model';

jest.mock(
  '../../../../../src/indexer/models/genetic-analysts/genetic-analysts.model',
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
      const _geneticAnalystsRegistered: GeneticAnalystsRegisteredCommandIndexer =
        new GeneticAnalystsRegisteredCommandIndexer(
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
        const _geneticAnalystsRegistered: GeneticAnalystsRegisteredCommandIndexer =
          new GeneticAnalystsRegisteredCommandIndexer([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts Stake Successful', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      /* eslint-disable */
      const _geneticAnalystsStakeSuccessful: GeneticAnalystsStakeSuccessfulCommandIndexer =
        new GeneticAnalystsStakeSuccessfulCommandIndexer(
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
        const _geneticAnalystsStakeSuccessful: GeneticAnalystsStakeSuccessfulCommandIndexer =
          new GeneticAnalystsStakeSuccessfulCommandIndexer(
            [{}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts update verification status', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      /* eslint-disable */
      const _geneticAnalystsUpdateVerificationStatus: GeneticAnalystsUpdateVerificationStatusCommandIndexer =
        new GeneticAnalystsUpdateVerificationStatusCommandIndexer(
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
        const _geneticAnalystsUpdateVerificationStatus: GeneticAnalystsUpdateVerificationStatusCommandIndexer =
          new GeneticAnalystsUpdateVerificationStatusCommandIndexer(
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
      const _geneticAnalystsUpdated: GeneticAnalystsUpdatedCommandIndexer =
        new GeneticAnalystsUpdatedCommandIndexer(
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
        const _geneticAnalystsUpdated: GeneticAnalystsUpdatedCommandIndexer =
          new GeneticAnalystsUpdatedCommandIndexer([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts Deleted Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      /* eslint-disable */
      const _geneticAnalystsDeleted: GeneticAnalystsDeletedCommandIndexer =
        new GeneticAnalystsDeletedCommandIndexer(
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
        const _geneticAnalystsDeleted: GeneticAnalystsDeletedCommandIndexer =
          new GeneticAnalystsDeletedCommandIndexer([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts update availability status Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      /* eslint-disable */
      const _geneticAnalystsUpdateAvailabilityStatus: GeneticAnalystsUpdateAvailabilityStatusCommandIndexer =
        new GeneticAnalystsUpdateAvailabilityStatusCommandIndexer(
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
        const _geneticAnalystsUpdateAvailabilityStatus: GeneticAnalystsUpdateAvailabilityStatusCommandIndexer =
          new GeneticAnalystsUpdateAvailabilityStatusCommandIndexer(
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
      const _geneticAnalystsRetrieveUnstakeAmount: GeneticAnalystsRetrieveUnstakeAmountCommandIndexer =
        new GeneticAnalystsRetrieveUnstakeAmountCommandIndexer(
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
        const _geneticAnalystsRetrieveUnstakeAmount: GeneticAnalystsRetrieveUnstakeAmountCommandIndexer =
          new GeneticAnalystsRetrieveUnstakeAmountCommandIndexer(
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
      const _geneticAnalystsUnstakeSuccessful: GeneticAnalystUnstakeSuccessfulCommandIndexer =
        new GeneticAnalystUnstakeSuccessfulCommandIndexer(
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
        const _geneticAnalystsUnstakeSuccessful: GeneticAnalystUnstakeSuccessfulCommandIndexer =
          new GeneticAnalystUnstakeSuccessfulCommandIndexer(
            [{}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts verification failed Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts();

      /* eslint-disable */
      const _geneticAnalystsVerificationFailed: GeneticAnalystVerificationFailedCommandIndexer =
        new GeneticAnalystVerificationFailedCommandIndexer(
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
        const _geneticAnalystsVerificationFailed: GeneticAnalystVerificationFailedCommandIndexer =
          new GeneticAnalystVerificationFailedCommandIndexer(
            [{}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrowError();
    });
  });
});
