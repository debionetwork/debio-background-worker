import { BlockMetaData } from '../../../../src/substrate/models/blockMetaData';
import { DataStakedCommand } from '../../../../src/substrate/events/genetic-testing';
import { DataStaked } from '../../../../src/substrate/events/genetic-testing/models/data-staked';

jest.mock(
  '../../../../src/substrate/events/genetic-testing/models/data-staked',
);

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
      const _dataStakedCommand: DataStakedCommand = new DataStakedCommand(
        DATA_STAKED_PARAM,
        mockBlockNumber(),
      );
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
