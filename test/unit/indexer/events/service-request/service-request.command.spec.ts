import { RequestModel } from '@indexer/models/service-request/request';
import { CreateServiceRequestCommandIndexer } from '@indexer/events/service-request';
import { RequestStatus } from '@indexer/models/service-request/request-status';
import { BlockMetaData } from '@indexer/models/block-meta-data';

jest.mock('@indexer/models/service-request/request');
jest.mock('@indexer/models/service-request/claim-request');
jest.mock('@indexer/models/service-request/service-invoice');

describe('Service Request Substrate Event Handler', () => {
  const createMockRequest = (requestStatus: RequestStatus) => {
    return [
      {},
      {
        toHuman: jest.fn(() => ({
          hash_: 'string',
          requesterAddress: 'string',
          labAddress: 'string',
          country: 'XX',
          region: 'XX',
          city: 'XX',
          serviceCategory: 'Test',
          stakingAmount: '1000000000000',
          status: requestStatus,
          createdAt: '1',
          updatedAt: '1',
          unstakedAt: '1',
        })),
      },
    ];
  };

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: 'string',
      blockNumber: 1,
    };
  }

  describe('Service Request Created Command', () => {
    it('should called Model and toHuman()', () => {
      const MOCK_DATA = createMockRequest(RequestStatus.Open);

      /* eslint-disable */
      const _serviceRequestCreatedCommand: CreateServiceRequestCommandIndexer =
        new CreateServiceRequestCommandIndexer(MOCK_DATA, mockBlockNumber());
      /* eslint-enable */
      expect(MOCK_DATA[1].toHuman).toHaveBeenCalled();
      expect(RequestModel).toHaveBeenCalled();
      expect(RequestModel).toHaveBeenCalledWith(MOCK_DATA[1].toHuman());
    });

    it('should throw error', () => {
      expect(() => {
        /* eslint-disable */
        const _serviceRequestCreatedCommand: CreateServiceRequestCommandIndexer =
          new CreateServiceRequestCommandIndexer([{}, {}], mockBlockNumber());
        /* eslint-enable */
      }).toThrow();
    });
  });
});
