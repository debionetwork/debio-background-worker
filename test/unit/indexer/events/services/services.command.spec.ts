import {
  ServiceCreatedCommandIndexer,
  ServiceDeletedCommandIndexer,
  ServiceUpdatedCommandIndexer,
} from '@indexer/events/services';
import { BlockMetaData } from '@indexer/models/block-meta-data';
import { ServiceFlow } from '@indexer/models/service-flow';
import { Service } from '@indexer/models/service/service';

jest.mock('@indexer/models/service/service');

describe('Services Substrate Event Handler', () => {
  function createMockService() {
    const first_price = {
      component: 'string',
      value: 1,
    };
    const second_price = {
      component: 'string',
      value: 1,
    };

    const prices_by_currency = {
      currency: 'XX',
      totalPrice: 1,
      priceComponents: [first_price],
      additionalPrices: [second_price],
    };

    const service_info = {
      name: 'string',
      pricesByCurrency: [prices_by_currency],
      expected_duration: '',
      category: 'string',
      description: 'string',
      dnaCollectionProcess: '',
      testResultSample: 'string',
      longDescription: 'string',
      image: 'string',
    };

    return {
      toHuman: jest.fn(() => ({
        info: service_info,
        id: 'string',
        ownerId: 'string',
        serviceFlow: ServiceFlow.RequestTest,
      })),
    };
  }

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: '',
      blockNumber: 1,
    };
  }

  describe('Services Created Command', () => {
    it('should called model data and toHuman', () => {
      const SERVICES_PARAM = createMockService();

      /* eslint-disable */
      const _servicesCreatedCommand: ServiceCreatedCommandIndexer =
        new ServiceCreatedCommandIndexer([SERVICES_PARAM], mockBlockNumber());
      /* eslint-enable */
      expect(Service).toHaveBeenCalled();
      expect(Service).toHaveBeenCalledWith(SERVICES_PARAM.toHuman());
      expect(SERVICES_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _servicesCreatedCommand: ServiceCreatedCommandIndexer =
          new ServiceCreatedCommandIndexer([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Services Updated Command', () => {
    it('should called model data and toHuman', () => {
      const SERVICES_PARAM = createMockService();

      /* eslint-disable */
      const _servicesUpdatedCommand: ServiceUpdatedCommandIndexer =
        new ServiceUpdatedCommandIndexer([SERVICES_PARAM], mockBlockNumber());
      /* eslint-enable */
      expect(Service).toHaveBeenCalled();
      expect(Service).toHaveBeenCalledWith(SERVICES_PARAM.toHuman());
      expect(SERVICES_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _servicesUpdatedCommand: ServiceUpdatedCommandIndexer =
          new ServiceUpdatedCommandIndexer([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Services Deleted Command', () => {
    it('should called model data and toHuman', () => {
      const SERVICES_PARAM = createMockService();

      /* eslint-disable */
      const _servicesDeletedCommand: ServiceDeletedCommandIndexer =
        new ServiceDeletedCommandIndexer([SERVICES_PARAM], mockBlockNumber());
      /* eslint-enable */
      expect(Service).toHaveBeenCalled();
      expect(Service).toHaveBeenCalledWith(SERVICES_PARAM.toHuman());
      expect(SERVICES_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _servicesDeletedCommand: ServiceDeletedCommandIndexer =
          new ServiceDeletedCommandIndexer([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });
});
