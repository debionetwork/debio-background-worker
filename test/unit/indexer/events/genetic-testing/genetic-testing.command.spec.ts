import { BlockMetaData } from '@indexer/models/block-meta-data';
import { DataStakedCommandIndexer } from '@indexer/events/genetic-testing';
import { DataStaked } from '@indexer/models/genetic-testing/data-staked';

jest.mock('@indexer/models/genetic-testing/data-staked');

describe('Genetic Testing Substrate Event Handler', () => {
  const createMockDataStaked = () => {
    return ['string', 'string', 'string'];
  };

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: '',
      blockNumber: 1,
    };
  }

  describe('Data Staked Command', () => {
    it('should called model data', () => {
      const DATA_STAKED_PARAM = createMockDataStaked();

      /* eslint-disable */
      const _dataStakedCommand: DataStakedCommandIndexer =
        new DataStakedCommandIndexer(DATA_STAKED_PARAM, mockBlockNumber());
      /* eslint-enable */
      expect(DataStaked).toHaveBeenCalled();
      expect(DataStaked).toHaveBeenCalledWith(
        DATA_STAKED_PARAM[0],
        DATA_STAKED_PARAM[1],
        DATA_STAKED_PARAM[2],
      );
    });
  });
});
