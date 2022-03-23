import {
  LabDeregisteredCommand,
  LabRegisteredCommand,
  LabUpdatedCommand,
  LabUpdateVerificationStatusCommand,
} from '../../../../src/substrate/events/labs';
import { BlockMetaData } from '../../../../src/substrate/models/blockMetaData';
import { Lab } from '../../../../src/substrate/events/labs/models/lab';

jest.mock('../../../../src/substrate/events/labs/models/lab');

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

      const _labRegisteredCommand: LabRegisteredCommand = new LabRegisteredCommand([LAB_PARAM], mockBlockNumber()); // eslint-disable-line
      expect(Lab).toHaveBeenCalled();
      expect(Lab).toHaveBeenCalledWith(LAB_PARAM.toHuman());
      expect(LAB_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _labRegisteredCommand: LabRegisteredCommand = new LabRegisteredCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });

  describe('Lab Updated Command', () => {
    it('should called model data and toHuman', () => {
      const LAB_PARAM = createMockLab();

      const _labUpdatedCommand: LabUpdatedCommand = new LabUpdatedCommand([LAB_PARAM], mockBlockNumber()); // eslint-disable-line
      expect(Lab).toHaveBeenCalled();
      expect(Lab).toHaveBeenCalledWith(LAB_PARAM.toHuman());
      expect(LAB_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _labUpdatedCommand: LabUpdatedCommand = new LabUpdatedCommand([{}], mockBlockNumber()); // eslint-disable-line  
      }).toThrowError();
    });
  });

  describe('Lab Deregistered Command', () => {
    it('should called model data and toHuman', () => {
      const LAB_PARAM = createMockLab();

      const _labDeregisteredCommand: LabDeregisteredCommand = new LabDeregisteredCommand([LAB_PARAM], mockBlockNumber()); // eslint-disable-line
      expect(Lab).toHaveBeenCalled();
      expect(Lab).toHaveBeenCalledWith(LAB_PARAM.toHuman());
      expect(LAB_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _labDeregisteredCommand: LabDeregisteredCommand = new LabDeregisteredCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });

  describe('Lab Update Verification Status Command', () => {
    it('should called model data and toHuman', () => {
      const LAB_PARAM = createMockLab();

      const _labUpdateVerificationStatusCommand: LabUpdateVerificationStatusCommand = new LabUpdateVerificationStatusCommand([LAB_PARAM], mockBlockNumber()); // eslint-disable-line
      expect(Lab).toHaveBeenCalled();
      expect(Lab).toHaveBeenCalledWith(LAB_PARAM.toHuman());
      expect(LAB_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _labUpdateVerificationStatusCommand: LabUpdateVerificationStatusCommand = new LabUpdateVerificationStatusCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });
});
