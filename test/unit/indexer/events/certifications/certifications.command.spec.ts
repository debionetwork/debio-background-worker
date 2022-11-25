import { BlockMetaData } from '@indexer/models/block-meta-data';
import {
  CertificationCreatedCommandIndexer,
  CertificationDeletedCommandIndexer,
  CertificationUpdatedCommandIndexer,
} from '@indexer/events/certifications';
import { Certification } from '@indexer/models/certification/certification';

jest.mock('@indexer/models/certification/certification');

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
      const _certificationCreatedCommand: CertificationCreatedCommandIndexer =
        new CertificationCreatedCommandIndexer(
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
        const _certificationCreatedCommand: CertificationCreatedCommandIndexer =
          new CertificationCreatedCommandIndexer([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Certification Updated Command', () => {
    it('should called model data and toHuman', () => {
      const CERTIFICATION_PARAM = createMockCertifications();

      /* eslint-disable */
      const _certificationUpdatedCommand: CertificationUpdatedCommandIndexer =
        new CertificationUpdatedCommandIndexer(
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
        const _certificationUpdatedCommand: CertificationUpdatedCommandIndexer =
          new CertificationUpdatedCommandIndexer([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Certification Deleted Command', () => {
    it('should called model data and toHuman', () => {
      const CERTIFICATION_PARAM = createMockCertifications();

      /* eslint-disable */
      const _certificationDeletedCommand: CertificationDeletedCommandIndexer =
        new CertificationDeletedCommandIndexer(
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
        const _certificationDeletedCommand: CertificationDeletedCommandIndexer =
          new CertificationDeletedCommandIndexer([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });
});
