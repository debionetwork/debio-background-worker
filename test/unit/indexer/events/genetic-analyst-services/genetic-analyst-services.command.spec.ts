import {
  GeneticAnalystServicesCreatedCommandIndexer,
  GeneticAnalystServicesUpdatedCommandIndexer,
  GeneticAnalystServicesDeletedCommandIndexer,
} from '../../../../../src/indexer/events/genetic-analyst-services';
import { BlockMetaData } from '../../../../../src/indexer/models/block-meta-data';
import { GeneticAnalystsServicesModel } from '../../../../../src/indexer/models/genetic-analysts-services/genetic-analysts-services.model';

jest.mock(
  '../../../../../src/indexer/models/genetic-analysts-services/genetic-analysts-services.model',
);

describe('Genetic Analysts Services Substrate Event Handler', () => {
  const createMockGeneticAnalystsServices = () => {
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

  describe('Genetic Analysts Services Created Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_SERVICES_PARAM =
        createMockGeneticAnalystsServices();

      /* eslint-disable */
      const _geneticAnalystsServicesCreated: GeneticAnalystServicesCreatedCommandIndexer =
        new GeneticAnalystServicesCreatedCommandIndexer(
          [GENETIC_ANALYSTS_SERVICES_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalystsServicesModel).toHaveBeenCalled();
      expect(GeneticAnalystsServicesModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_SERVICES_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_SERVICES_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalystsServicesCreated: GeneticAnalystServicesCreatedCommandIndexer =
          new GeneticAnalystServicesCreatedCommandIndexer(
            [{}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts Services Updated Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_SERVICES_PARAM =
        createMockGeneticAnalystsServices();

      /* eslint-disable */
      const _geneticAnalystsServicesUpdated: GeneticAnalystServicesUpdatedCommandIndexer =
        new GeneticAnalystServicesUpdatedCommandIndexer(
          [GENETIC_ANALYSTS_SERVICES_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalystsServicesModel).toHaveBeenCalled();
      expect(GeneticAnalystsServicesModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_SERVICES_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_SERVICES_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalystsServicesUpdated: GeneticAnalystServicesUpdatedCommandIndexer =
          new GeneticAnalystServicesUpdatedCommandIndexer(
            [{}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts Services Deleted Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_SERVICES_PARAM =
        createMockGeneticAnalystsServices();

      /* eslint-disable */
      const _geneticAnalystsServicesDeleted: GeneticAnalystServicesDeletedCommandIndexer =
        new GeneticAnalystServicesDeletedCommandIndexer(
          [GENETIC_ANALYSTS_SERVICES_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalystsServicesModel).toHaveBeenCalled();
      expect(GeneticAnalystsServicesModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_SERVICES_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_SERVICES_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalystsServicesDeleted: GeneticAnalystServicesDeletedCommandIndexer =
          new GeneticAnalystServicesDeletedCommandIndexer(
            [{}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrowError();
    });
  });
});
