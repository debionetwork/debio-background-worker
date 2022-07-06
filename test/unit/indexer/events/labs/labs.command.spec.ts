import {
  LabDeregisteredCommand,
  LabRegisteredCommand,
  LabUpdatedCommand,
  LabUpdateVerificationStatusCommand,
} from '../../../../../src/indexer/events/labs';
import { BlockMetaData } from '../../../../../src/indexer/models/blockMetaData';
import { Lab } from '../../../../../src/indexer/models/lab/lab';
import { StakeStatus } from '../../../../../src/indexer/models/stake-status';
import { LabRetrieveUnstakeAmountCommand } from '../../../../../src/indexer/events/labs/commands/lab-retrieve-unstake-amount/lab-retrieve-unstake-amount.command';
import { LabStakeSuccessfulCommand } from '../../../../../src/indexer/events/labs/commands/lab-stake-successful/lab-stake-successful.command';
import { LabUnstakeSuccessfulCommand } from '../../../../../src/indexer/events/labs/commands/lab-unstake-successful/lab-unstake-successful.command';

jest.mock('../../../../../src/indexer/models/lab/lab');

describe('Labs Substrate Event Handler', () => {
  const createMockLab = () => {
    const labInfo = {
      boxPublicKey: 'string',
      name: 'string',
      email: 'string',
      phoneNumber: 'string',
      website: 'string',
      country: 'XX',
      region: 'XX',
      city: 'XX',
      address: 'string',
      latitude: 'string',
      longitude: 'string',
      profileImage: 'string',
    };

    return {
      toHuman: jest.fn(() => ({
        accountId: 'string',
        services: [],
        certifications: [],
        verificationStatus: [],
        info: labInfo,
        stakeAmount: '1000000',
        stakeStatus: StakeStatus.Staked,
        unstakeAt: '100000000',
        retrieveUnstakeAt: '100000000',
      })),
    };
  };

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: '',
      blockNumber: 1,
    };
  }

  describe('Lab Registered Command', () => {
    it('should called model data and toHuman', () => {
      const LAB_PARAM = createMockLab();

      /* eslint-disable */
      const _labRegisteredCommand: LabRegisteredCommand =
        new LabRegisteredCommand([LAB_PARAM], mockBlockNumber());
      /* eslint-enable */
      expect(Lab).toHaveBeenCalled();
      expect(Lab).toHaveBeenCalledWith(LAB_PARAM.toHuman());
      expect(LAB_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _labRegisteredCommand: LabRegisteredCommand =
          new LabRegisteredCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Lab Updated Command', () => {
    it('should called model data and toHuman', () => {
      const LAB_PARAM = createMockLab();

      /* eslint-disable */
      const _labUpdatedCommand: LabUpdatedCommand = new LabUpdatedCommand(
        [LAB_PARAM],
        mockBlockNumber(),
      );
      /* eslint-enable */
      expect(Lab).toHaveBeenCalled();
      expect(Lab).toHaveBeenCalledWith(LAB_PARAM.toHuman());
      expect(LAB_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _labUpdatedCommand: LabUpdatedCommand = new LabUpdatedCommand(
          [{}],
          mockBlockNumber(),
        );
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Lab Deregistered Command', () => {
    it('should called model data and toHuman', () => {
      const LAB_PARAM = createMockLab();

      /* eslint-disable */
      const _labDeregisteredCommand: LabDeregisteredCommand =
        new LabDeregisteredCommand([LAB_PARAM], mockBlockNumber());
      /* eslint-enable */
      expect(Lab).toHaveBeenCalled();
      expect(Lab).toHaveBeenCalledWith(LAB_PARAM.toHuman());
      expect(LAB_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _labDeregisteredCommand: LabDeregisteredCommand =
          new LabDeregisteredCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Lab Update Verification Status Command', () => {
    it('should called model data and toHuman', () => {
      const LAB_PARAM = createMockLab();

      /* eslint-disable */
      const _labUpdateVerificationStatusCommand: LabUpdateVerificationStatusCommand =
        new LabUpdateVerificationStatusCommand([LAB_PARAM], mockBlockNumber());
      /* eslint-enable */
      expect(Lab).toHaveBeenCalled();
      expect(Lab).toHaveBeenCalledWith(LAB_PARAM.toHuman());
      expect(LAB_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _labUpdateVerificationStatusCommand: LabUpdateVerificationStatusCommand =
          new LabUpdateVerificationStatusCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Lab Retrieve Unstake Amount Command', () => {
    it('should called model data and toHuman', () => {
      const LAB_PARAM = createMockLab();

      /* eslint-disable */
      const _labRetrieveUnstakeAmountCommand: LabRetrieveUnstakeAmountCommand =
        new LabRetrieveUnstakeAmountCommand([LAB_PARAM], mockBlockNumber());
      /* eslint-enable */
      expect(Lab).toHaveBeenCalled();
      expect(Lab).toHaveBeenCalledWith(LAB_PARAM.toHuman());
      expect(LAB_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _labRetrieveUnstakeAmountCommand: LabRetrieveUnstakeAmountCommand =
          new LabRetrieveUnstakeAmountCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Lab Stake Successful Command', () => {
    it('should called model data and toHuman', () => {
      const LAB_PARAM = createMockLab();

      /* eslint-disable */
      const _labStakeSuccessfulCommand: LabStakeSuccessfulCommand =
        new LabStakeSuccessfulCommand([LAB_PARAM], mockBlockNumber());
      /* eslint-enable */
      expect(Lab).toHaveBeenCalled();
      expect(Lab).toHaveBeenCalledWith(LAB_PARAM.toHuman());
      expect(LAB_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _labStakeSuccessfulCommand: LabStakeSuccessfulCommand =
          new LabStakeSuccessfulCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Lab Unstake Successful Command', () => {
    it('should called model data and toHuman', () => {
      const LAB_PARAM = createMockLab();

      /* eslint-disable */
      const _labUnstakeSuccessfulCommand: LabUnstakeSuccessfulCommand =
        new LabUnstakeSuccessfulCommand([LAB_PARAM], mockBlockNumber());
      /* eslint-enable */
      expect(Lab).toHaveBeenCalled();
      expect(Lab).toHaveBeenCalledWith(LAB_PARAM.toHuman());
      expect(LAB_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _labUnstakeSuccessfulCommand: LabUnstakeSuccessfulCommand =
          new LabUnstakeSuccessfulCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });
});
