import { BlockMetaData } from '../../../../src/substrate/models/blockMetaData';
import {
  CertificationCreatedCommand,
  CertificationDeletedCommand,
  CertificationUpdatedCommand,
} from '../../../../src/substrate/events/certifications';
import { Certification } from '../../../../src/substrate/models/certification/certification';

jest.mock('../../../../src/substrate/models/certification/certification');

describe('Certifications Substrate Event Handler', () => {
  const createMockCertifications = () => {
    const info = {
      title: 'string',
      issuer: 'string',
      month: 'string',
      year: 'string',
      description: 'string',
      supportingDocument: 'string',
    };
    return {
      toHuman: jest.fn(() => ({
        id: 'string',
        ownerId: 'string',
        info: info,
      })),
    };
  };

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: '',
      blockNumber: 1,
    };
  }

  describe('Certification Created Command', () => {
    it('should called model data and toHuman', () => {
      const CERTIFICATION_PARAM = createMockCertifications();

      /* eslint-disable */
      const _certificationCreatedCommand: CertificationCreatedCommand =
        new CertificationCreatedCommand(
          [CERTIFICATION_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(Certification).toHaveBeenCalled();
      expect(Certification).toHaveBeenCalledWith(CERTIFICATION_PARAM.toHuman());
      expect(CERTIFICATION_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _certificationCreatedCommand: CertificationCreatedCommand =
          new CertificationCreatedCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Certification Updated Command', () => {
    it('should called model data and toHuman', () => {
      const CERTIFICATION_PARAM = createMockCertifications();

      /* eslint-disable */
      const _certificationUpdatedCommand: CertificationUpdatedCommand =
        new CertificationUpdatedCommand(
          [CERTIFICATION_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(Certification).toHaveBeenCalled();
      expect(Certification).toHaveBeenCalledWith(CERTIFICATION_PARAM.toHuman());
      expect(CERTIFICATION_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _certificationUpdatedCommand: CertificationUpdatedCommand =
          new CertificationUpdatedCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Certification Deleted Command', () => {
    it('should called model data and toHuman', () => {
      const CERTIFICATION_PARAM = createMockCertifications();

      /* eslint-disable */
      const _certificationDeletedCommand: CertificationDeletedCommand =
        new CertificationDeletedCommand(
          [CERTIFICATION_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(Certification).toHaveBeenCalled();
      expect(Certification).toHaveBeenCalledWith(CERTIFICATION_PARAM.toHuman());
      expect(CERTIFICATION_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _certificationDeletedCommand: CertificationDeletedCommand =
          new CertificationDeletedCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });
});
