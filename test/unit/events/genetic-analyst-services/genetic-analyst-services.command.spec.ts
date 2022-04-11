import {
  GeneticAnalystServicesCreatedCommand,
  GeneticAnalystServicesUpdatedCommand,
  GeneticAnalystServicesDeletedCommand,
} from '../../../../src/substrate/events/genetic-analyst-services';
import { BlockMetaData } from '../../../../src/substrate/models/blockMetaData';
import { GeneticAnalystsServicesModel } from '../../../../src/substrate/models/genetic-analysts-services/genetic-analysts-services.model';

jest.mock(
  '../../../../src/substrate/models/genetic-analysts-services/genetic-analysts-services.model',
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
      const _geneticAnalystsServicesCreated: GeneticAnalystServicesCreatedCommand =
        new GeneticAnalystServicesCreatedCommand(
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
        const _geneticAnalystsServicesCreated: GeneticAnalystServicesCreatedCommand =
          new GeneticAnalystServicesCreatedCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts Services Updated Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_SERVICES_PARAM =
        createMockGeneticAnalystsServices();

      /* eslint-disable */
      const _geneticAnalystsServicesUpdated: GeneticAnalystServicesUpdatedCommand =
        new GeneticAnalystServicesUpdatedCommand(
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
        const _geneticAnalystsServicesUpdated: GeneticAnalystServicesUpdatedCommand =
          new GeneticAnalystServicesUpdatedCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysts Services Deleted Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_SERVICES_PARAM =
        createMockGeneticAnalystsServices();

      /* eslint-disable */
      const _geneticAnalystsServicesDeleted: GeneticAnalystServicesDeletedCommand =
        new GeneticAnalystServicesDeletedCommand(
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
        const _geneticAnalystsServicesDeleted: GeneticAnalystServicesDeletedCommand =
          new GeneticAnalystServicesDeletedCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });
});
