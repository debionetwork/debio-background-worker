import {
  AddGeneticDataCommand,
  RemoveGeneticDataCommand,
  UpdateGeneticDataCommand,
} from '../../../../src/substrate/events/genetic-data';
import { BlockMetaData } from '../../../../src/substrate/models/blockMetaData';
import { GeneticDataModel } from '../../../../src/substrate/models/genetic-data/genetic-data.model';

jest.mock('../../../../src/substrate/models/genetic-data/genetic-data.model');

describe('Genetic Data Substrate Event Handler', () => {
  const createMockGeneticData = () => {
    return {
      toHuman: jest.fn(() => ({
        id: 'string',
        ownerId: 'string',
        title: 'string',
        description: 'string',
        reportLink: 'string',
        supportingDocument: 'string',
      })),
    };
  };

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: '',
      blockNumber: 1,
    };
  }

  describe('Add Genetic Data Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_DATA_PARAM = createMockGeneticData();

      const _addGeneticDataCommand: AddGeneticDataCommand = new AddGeneticDataCommand([GENETIC_DATA_PARAM], mockBlockNumber()); // eslint-disable-line
      expect(GeneticDataModel).toHaveBeenCalled();
      expect(GeneticDataModel).toHaveBeenCalledWith(
        GENETIC_DATA_PARAM.toHuman(),
      );
      expect(GENETIC_DATA_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _addGeneticDataCommand: AddGeneticDataCommand = new AddGeneticDataCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });

  describe('Remove Genetic Data Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_DATA_PARAM = createMockGeneticData();

      const _removeGeneticDataCommand: RemoveGeneticDataCommand = new RemoveGeneticDataCommand([GENETIC_DATA_PARAM], mockBlockNumber()); // eslint-disable-line
      expect(GeneticDataModel).toHaveBeenCalled();
      expect(GeneticDataModel).toHaveBeenCalledWith(
        GENETIC_DATA_PARAM.toHuman(),
      );
      expect(GENETIC_DATA_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _removeGeneticDataCommand: RemoveGeneticDataCommand = new RemoveGeneticDataCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });

  describe('Update Genetic Data Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_DATA_PARAM = createMockGeneticData();

      const _updateGeneticDataCommand: UpdateGeneticDataCommand = new UpdateGeneticDataCommand([GENETIC_DATA_PARAM], mockBlockNumber()); // eslint-disable-line
      expect(GeneticDataModel).toHaveBeenCalled();
      expect(GeneticDataModel).toHaveBeenCalledWith(
        GENETIC_DATA_PARAM.toHuman(),
      );
      expect(GENETIC_DATA_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _updateGeneticDataCommand: UpdateGeneticDataCommand = new UpdateGeneticDataCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });
});
