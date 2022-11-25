import {
  AddGeneticDataCommandIndexer,
  RemoveGeneticDataCommandIndexer,
  UpdateGeneticDataCommandIndexer,
} from '@indexer/events/genetic-data';
import { BlockMetaData } from '@indexer/models/block-meta-data';
import { GeneticDataModel } from '@indexer/models/genetic-data/genetic-data.model';

jest.mock('@indexer/models/genetic-data/genetic-data.model');

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
      const _addGeneticDataCommand: AddGeneticDataCommandIndexer =
        new AddGeneticDataCommandIndexer(
          [GENETIC_DATA_PARAM],
          mockBlockNumber(),
        );
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
        const _addGeneticDataCommand: AddGeneticDataCommandIndexer =
          new AddGeneticDataCommandIndexer([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Remove Genetic Data Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_DATA_PARAM = createMockGeneticData();

      /* eslint-disable */
      const _removeGeneticDataCommand: RemoveGeneticDataCommandIndexer =
        new RemoveGeneticDataCommandIndexer(
          [GENETIC_DATA_PARAM],
          mockBlockNumber(),
        );
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
        const _removeGeneticDataCommand: RemoveGeneticDataCommandIndexer =
          new RemoveGeneticDataCommandIndexer([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Update Genetic Data Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_DATA_PARAM = createMockGeneticData();

      /* eslint-disable */
      const _updateGeneticDataCommand: UpdateGeneticDataCommandIndexer =
        new UpdateGeneticDataCommandIndexer(
          [GENETIC_DATA_PARAM],
          mockBlockNumber(),
        );
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
        const _updateGeneticDataCommand: UpdateGeneticDataCommandIndexer =
          new UpdateGeneticDataCommandIndexer([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });
});
