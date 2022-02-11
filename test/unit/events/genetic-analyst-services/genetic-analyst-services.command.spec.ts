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

      const _geneticAnalystsServicesCreated: GeneticAnalystServicesCreatedCommand =
        new GeneticAnalystServicesCreatedCommand(
          [GENETIC_ANALYSTS_SERVICES_PARAM],
          mockBlockNumber(),
        );
      expect(GeneticAnalystsServicesModel).toHaveBeenCalled();
      expect(GeneticAnalystsServicesModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_SERVICES_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_SERVICES_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalystsServicesCreated: GeneticAnalystServicesCreatedCommand =
          new GeneticAnalystServicesCreatedCommand([{}], mockBlockNumber());
      }).toThrowError();
    });
  });

  describe('Genetic Analysts Services Updated Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_SERVICES_PARAM =
        createMockGeneticAnalystsServices();

      const _geneticAnalystsServicesUpdated: GeneticAnalystServicesUpdatedCommand =
        new GeneticAnalystServicesUpdatedCommand(
          [GENETIC_ANALYSTS_SERVICES_PARAM],
          mockBlockNumber(),
        );
      expect(GeneticAnalystsServicesModel).toHaveBeenCalled();
      expect(GeneticAnalystsServicesModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_SERVICES_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_SERVICES_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalystsServicesUpdated: GeneticAnalystServicesUpdatedCommand =
          new GeneticAnalystServicesUpdatedCommand([{}], mockBlockNumber());
      }).toThrowError();
    });
  });

  describe('Genetic Analysts Services Deleted Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSTS_SERVICES_PARAM =
        createMockGeneticAnalystsServices();

      const _geneticAnalystsServicesDeleted: GeneticAnalystServicesDeletedCommand =
        new GeneticAnalystServicesDeletedCommand(
          [GENETIC_ANALYSTS_SERVICES_PARAM],
          mockBlockNumber(),
        );
      expect(GeneticAnalystsServicesModel).toHaveBeenCalled();
      expect(GeneticAnalystsServicesModel).toHaveBeenCalledWith(
        GENETIC_ANALYSTS_SERVICES_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSTS_SERVICES_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalystsServicesDeleted: GeneticAnalystServicesDeletedCommand =
          new GeneticAnalystServicesDeletedCommand([{}], mockBlockNumber());
      }).toThrowError();
    });
  });
});
