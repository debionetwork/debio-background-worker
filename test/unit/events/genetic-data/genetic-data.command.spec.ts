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

      /* eslint-disable */
      const _addGeneticDataCommand: AddGeneticDataCommand =
        new AddGeneticDataCommand([GENETIC_DATA_PARAM], mockBlockNumber());
      /* eslint-enable */
      expect(GeneticDataModel).toHaveBeenCalled();
      expect(GeneticDataModel).toHaveBeenCalledWith(
        GENETIC_DATA_PARAM.toHuman(),
      );
      expect(GENETIC_DATA_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _addGeneticDataCommand: AddGeneticDataCommand =
          new AddGeneticDataCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Remove Genetic Data Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_DATA_PARAM = createMockGeneticData();

      /* eslint-disable */
      const _removeGeneticDataCommand: RemoveGeneticDataCommand =
        new RemoveGeneticDataCommand([GENETIC_DATA_PARAM], mockBlockNumber());
      /* eslint-enable */
      expect(GeneticDataModel).toHaveBeenCalled();
      expect(GeneticDataModel).toHaveBeenCalledWith(
        GENETIC_DATA_PARAM.toHuman(),
      );
      expect(GENETIC_DATA_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _removeGeneticDataCommand: RemoveGeneticDataCommand =
          new RemoveGeneticDataCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Update Genetic Data Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_DATA_PARAM = createMockGeneticData();

      /* eslint-disable */
      const _updateGeneticDataCommand: UpdateGeneticDataCommand =
        new UpdateGeneticDataCommand([GENETIC_DATA_PARAM], mockBlockNumber());
      /* eslint-enable */
      expect(GeneticDataModel).toHaveBeenCalled();
      expect(GeneticDataModel).toHaveBeenCalledWith(
        GENETIC_DATA_PARAM.toHuman(),
      );
      expect(GENETIC_DATA_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _updateGeneticDataCommand: UpdateGeneticDataCommand =
          new UpdateGeneticDataCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });
});
