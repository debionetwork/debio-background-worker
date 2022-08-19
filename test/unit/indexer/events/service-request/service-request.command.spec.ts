import { RequestModel } from '../../../../../src/indexer/models/service-request/request';
import {
  ClaimedServiceRequestCommandIndexer,
  CreateServiceRequestCommandIndexer,
  FinalizedServiceRequestCommandIndexer,
  ProcessedServiceRequestCommandIndexer,
  UnstakedServiceRequestCommandIndexer,
  UnstakedWaitingServiceRequestCommandIndexer,
} from '../../../../../src/indexer/events/service-request';
import { RequestStatus } from '../../../../../src/indexer/models/service-request/request-status';
import { BlockMetaData } from '../../../../../src/indexer/models/block-meta-data';
import { ClaimRequestModel } from '../../../../../src/indexer/models/service-request/claim-request';
import { ServiceInvoice } from '../../../../../src/indexer/models/service-request/service-invoice';

jest.mock('../../../../../src/indexer/models/service-request/request');
jest.mock('../../../../../src/indexer/models/service-request/claim-request');
jest.mock('../../../../../src/indexer/models/service-request/service-invoice');

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

  const createMockServiceInvoice = () => {
    return [
      {},
      {
        toHuman: jest.fn(() => ({
          requestHash: '',
          orderId: '',
          serviceId: '',
          customerAddress: '',
          sellerAddress: '',
          dnaSampleTrackingId: '',
          testingPrice: '',
          qcPrice: '',
          payAmount: '',
        })),
      },
    ];
  };

  const createMockClaimRequest = (): Array<any> => {
    return [
      {},
      {
        toHuman: jest.fn(() => ({
          requestHash: '',
          labAddress: '',
          serviceId: '',
          testingPrice: '',
          qcPrice: '',
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

  describe('Service Request Claimed Command', () => {
    it('should called Model and toHuman()', () => {
      const MOCK_DATA = createMockClaimRequest();

      /* eslint-disable */
      const _serviceRequestClaimedCommand: ClaimedServiceRequestCommandIndexer =
        new ClaimedServiceRequestCommandIndexer(MOCK_DATA, mockBlockNumber());
      /* eslint-enable */
      expect(MOCK_DATA[1].toHuman).toHaveBeenCalled();
      expect(ClaimRequestModel).toHaveBeenCalled();
      expect(ClaimRequestModel).toHaveBeenCalledWith(MOCK_DATA[1].toHuman());
    });

    it('should throw error', () => {
      expect(() => {
        /* eslint-disable */
        const _serviceRequestClaimedCommand: ClaimedServiceRequestCommandIndexer =
          new ClaimedServiceRequestCommandIndexer([{}, {}], mockBlockNumber());
        /* eslint-enable */
      }).toThrow();
    });
  });

  describe('Service Request Finalized Command', () => {
    it('should called Model and toHuman()', () => {
      const MOCK_DATA = createMockServiceInvoice();

      /* eslint-disable */
      const _serviceRequestFinalizedCommand: FinalizedServiceRequestCommandIndexer =
        new FinalizedServiceRequestCommandIndexer(MOCK_DATA, mockBlockNumber());
      /* eslint-enable */
      expect(MOCK_DATA[1].toHuman).toHaveBeenCalled();
      expect(ServiceInvoice).toHaveBeenCalled();
      expect(ServiceInvoice).toHaveBeenCalledWith(MOCK_DATA[1].toHuman());
    });

    it('should throw error', () => {
      expect(() => {
        /* eslint-disable */
        const _serviceRequestFinalizedCommand: FinalizedServiceRequestCommandIndexer =
          new FinalizedServiceRequestCommandIndexer(
            [{}, {}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrow();
    });
  });

  describe('Service Request Processed Command', () => {
    it('should called Model and toHuman()', () => {
      const MOCK_DATA = createMockServiceInvoice();

      /* eslint-disable */
      const _serviceRequestProcessedCommand: ProcessedServiceRequestCommandIndexer =
        new ProcessedServiceRequestCommandIndexer(MOCK_DATA, mockBlockNumber());
      /* eslint-enable */
      expect(MOCK_DATA[1].toHuman).toHaveBeenCalled();
      expect(ServiceInvoice).toHaveBeenCalled();
      expect(ServiceInvoice).toHaveBeenCalledWith(MOCK_DATA[1].toHuman());
    });

    it('should throw error', () => {
      expect(() => {
        /* eslint-disable */
        const _serviceRequestProcessedCommand: ProcessedServiceRequestCommandIndexer =
          new ProcessedServiceRequestCommandIndexer(
            [{}, {}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrow();
    });
  });

  describe('Service Request Unstaked Command', () => {
    it('should called Model and toHuman()', () => {
      const MOCK_DATA = createMockRequest(RequestStatus.Unstaked);

      /* eslint-disable */
      const _serviceRequestUnstakedCommand: UnstakedServiceRequestCommandIndexer =
        new UnstakedServiceRequestCommandIndexer(MOCK_DATA, mockBlockNumber());
      /* eslint-enable */
      expect(MOCK_DATA[1].toHuman).toHaveBeenCalled();
      expect(RequestModel).toHaveBeenCalled();
      expect(RequestModel).toHaveBeenCalledWith(MOCK_DATA[1].toHuman());
    });

    it('should throw error', () => {
      expect(() => {
        /* eslint-disable */
        const _serviceRequestUnstakedCommand: UnstakedServiceRequestCommandIndexer =
          new UnstakedServiceRequestCommandIndexer([{}, {}], mockBlockNumber());
        /* eslint-enable */
      }).toThrow();
    });
  });

  describe('Service Request Waiting For Unstaked Command', () => {
    it('should called Model and toHuman()', () => {
      const MOCK_DATA = createMockRequest(RequestStatus.Unstaked);

      /* eslint-disable */
      const _serviceRequestWaitingForUnstakedCommand: UnstakedWaitingServiceRequestCommandIndexer =
        new UnstakedWaitingServiceRequestCommandIndexer(
          MOCK_DATA,
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(MOCK_DATA[1].toHuman).toHaveBeenCalled();
      expect(RequestModel).toHaveBeenCalled();
      expect(RequestModel).toHaveBeenCalledWith(MOCK_DATA[1].toHuman());
    });

    it('should throw error', () => {
      expect(() => {
        /* eslint-disable */
        const _serviceRequestWaitingForUnstakedCommand: UnstakedWaitingServiceRequestCommandIndexer =
          new UnstakedWaitingServiceRequestCommandIndexer(
            [{}, {}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrow();
    });
  });
});
