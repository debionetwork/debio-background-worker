import { BlockMetaData } from '../../../../src/substrate/models/blockMetaData';
import {
  CertificationCreatedCommand,
  CertificationDeletedCommand,
  CertificationUpdatedCommand,
} from '../../../../src/substrate/events/certifications';
import { Certification } from '../../../../src/substrate/events/certifications/models/certification';

jest.mock(
  '../../../../src/substrate/events/certifications/models/certification',
);

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

      const _certificationCreatedCommand: CertificationCreatedCommand =
        new CertificationCreatedCommand(
          [CERTIFICATION_PARAM],
          mockBlockNumber(),
        ); // eslint-disable-line
      expect(Certification).toHaveBeenCalled();
      expect(Certification).toHaveBeenCalledWith(CERTIFICATION_PARAM.toHuman());
      expect(CERTIFICATION_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _certificationCreatedCommand: CertificationCreatedCommand =
          new CertificationCreatedCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });

  describe('Certification Updated Command', () => {
    it('should called model data and toHuman', () => {
      const CERTIFICATION_PARAM = createMockCertifications();

      const _certificationUpdatedCommand: CertificationUpdatedCommand =
        new CertificationUpdatedCommand(
          [CERTIFICATION_PARAM],
          mockBlockNumber(),
        ); // eslint-disable-line
      expect(Certification).toHaveBeenCalled();
      expect(Certification).toHaveBeenCalledWith(CERTIFICATION_PARAM.toHuman());
      expect(CERTIFICATION_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _certificationUpdatedCommand: CertificationUpdatedCommand =
          new CertificationUpdatedCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });

  describe('Certification Deleted Command', () => {
    it('should called model data and toHuman', () => {
      const CERTIFICATION_PARAM = createMockCertifications();

      const _certificationDeletedCommand: CertificationDeletedCommand =
        new CertificationDeletedCommand(
          [CERTIFICATION_PARAM],
          mockBlockNumber(),
        ); // eslint-disable-line
      expect(Certification).toHaveBeenCalled();
      expect(Certification).toHaveBeenCalledWith(CERTIFICATION_PARAM.toHuman());
      expect(CERTIFICATION_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _certificationDeletedCommand: CertificationDeletedCommand =
          new CertificationDeletedCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });
});
