import { RequestModel } from '../../../../src/substrate/events/service-request/models/request';
import {
  ClaimedServiceRequestCommand,
  CreateServiceRequestCommand,
  FinalizedServiceRequestCommand,
  ProcessedServiceRequestCommand,
  UnstakedServiceRequestCommand,
  UnstakedWaitingServiceRequestCommand,
} from '../../../../src/substrate/events/service-request';
import { RequestStatus } from '../../../../src/substrate/events/service-request/models/requestStatus';
import { BlockMetaData } from '../../../../src/substrate/models/blockMetaData';
import { ClaimRequestModel } from '../../../../src/substrate/events/service-request/models/claimRequest';
import { ServiceInvoice } from '../../../../src/substrate/events/service-request/models/serviceInvoice';

jest.mock('../../../../src/substrate/events/service-request/models/request');
jest.mock(
  '../../../../src/substrate/events/service-request/models/claimRequest',
);
jest.mock(
  '../../../../src/substrate/events/service-request/models/serviceInvoice',
);

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
      const _serviceRequestCreatedCommand: CreateServiceRequestCommand =
        new CreateServiceRequestCommand(MOCK_DATA, mockBlockNumber());
      /* eslint-enable */
      expect(MOCK_DATA[1].toHuman).toHaveBeenCalled();
      expect(RequestModel).toHaveBeenCalled();
      expect(RequestModel).toHaveBeenCalledWith(MOCK_DATA[1].toHuman());
    });

    it('should throw error', () => {
      expect(() => {
        /* eslint-disable */
        const _serviceRequestCreatedCommand: CreateServiceRequestCommand =
          new CreateServiceRequestCommand([{}, {}], mockBlockNumber());
        /* eslint-enable */
      }).toThrow();
    });
  });

  describe('Service Request Claimed Command', () => {
    it('should called Model and toHuman()', () => {
      const MOCK_DATA = createMockClaimRequest();

      /* eslint-disable */
      const _serviceRequestClaimedCommand: ClaimedServiceRequestCommand =
        new ClaimedServiceRequestCommand(MOCK_DATA, mockBlockNumber());
      /* eslint-enable */
      expect(MOCK_DATA[1].toHuman).toHaveBeenCalled();
      expect(ClaimRequestModel).toHaveBeenCalled();
      expect(ClaimRequestModel).toHaveBeenCalledWith(MOCK_DATA[1].toHuman());
    });

    it('should throw error', () => {
      expect(() => {
        /* eslint-disable */
        const _serviceRequestClaimedCommand: ClaimedServiceRequestCommand =
          new ClaimedServiceRequestCommand([{}, {}], mockBlockNumber());
        /* eslint-enable */
      }).toThrow();
    });
  });

  describe('Service Request Finalized Command', () => {
    it('should called Model and toHuman()', () => {
      const MOCK_DATA = createMockServiceInvoice();

      /* eslint-disable */
      const _serviceRequestFinalizedCommand: FinalizedServiceRequestCommand =
        new FinalizedServiceRequestCommand(MOCK_DATA, mockBlockNumber());
      /* eslint-enable */
      expect(MOCK_DATA[1].toHuman).toHaveBeenCalled();
      expect(ServiceInvoice).toHaveBeenCalled();
      expect(ServiceInvoice).toHaveBeenCalledWith(MOCK_DATA[1].toHuman());
    });

    it('should throw error', () => {
      expect(() => {
        /* eslint-disable */
        const _serviceRequestFinalizedCommand: FinalizedServiceRequestCommand =
          new FinalizedServiceRequestCommand([{}, {}], mockBlockNumber());
        /* eslint-enable */
      }).toThrow();
    });
  });

  describe('Service Request Processed Command', () => {
    it('should called Model and toHuman()', () => {
      const MOCK_DATA = createMockServiceInvoice();

      /* eslint-disable */
      const _serviceRequestProcessedCommand: ProcessedServiceRequestCommand =
        new ProcessedServiceRequestCommand(MOCK_DATA, mockBlockNumber());
      /* eslint-enable */
      expect(MOCK_DATA[1].toHuman).toHaveBeenCalled();
      expect(ServiceInvoice).toHaveBeenCalled();
      expect(ServiceInvoice).toHaveBeenCalledWith(MOCK_DATA[1].toHuman());
    });

    it('should throw error', () => {
      expect(() => {
        /* eslint-disable */
        const _serviceRequestProcessedCommand: ProcessedServiceRequestCommand =
          new ProcessedServiceRequestCommand([{}, {}], mockBlockNumber());
        /* eslint-enable */
      }).toThrow();
    });
  });

  describe('Service Request Unstaked Command', () => {
    it('should called Model and toHuman()', () => {
      const MOCK_DATA = createMockRequest(RequestStatus.Unstaked);

      /* eslint-disable */
      const _serviceRequestUnstakedCommand: UnstakedServiceRequestCommand =
        new UnstakedServiceRequestCommand(MOCK_DATA, mockBlockNumber());
      /* eslint-enable */
      expect(MOCK_DATA[1].toHuman).toHaveBeenCalled();
      expect(RequestModel).toHaveBeenCalled();
      expect(RequestModel).toHaveBeenCalledWith(MOCK_DATA[1].toHuman());
    });

    it('should throw error', () => {
      expect(() => {
        /* eslint-disable */
        const _serviceRequestUnstakedCommand: UnstakedServiceRequestCommand =
          new UnstakedServiceRequestCommand([{}, {}], mockBlockNumber());
        /* eslint-enable */
      }).toThrow();
    });
  });

  describe('Service Request Waiting For Unstaked Command', () => {
    it('should called Model and toHuman()', () => {
      const MOCK_DATA = createMockRequest(RequestStatus.Unstaked);

      /* eslint-disable */
      const _serviceRequestWaitingForUnstakedCommand: UnstakedWaitingServiceRequestCommand =
        new UnstakedWaitingServiceRequestCommand(MOCK_DATA, mockBlockNumber());
      /* eslint-enable */
      expect(MOCK_DATA[1].toHuman).toHaveBeenCalled();
      expect(RequestModel).toHaveBeenCalled();
      expect(RequestModel).toHaveBeenCalledWith(MOCK_DATA[1].toHuman());
    });

    it('should throw error', () => {
      expect(() => {
        /* eslint-disable */
        const _serviceRequestWaitingForUnstakedCommand: UnstakedWaitingServiceRequestCommand =
          new UnstakedWaitingServiceRequestCommand([{}, {}], mockBlockNumber());
        /* eslint-enable */
      }).toThrow();
    });
  });
});
