import {
  ServiceCreatedCommand,
  ServiceDeletedCommand,
  ServiceUpdatedCommand,
} from '../../../../../src/indexer/events/services';
import { BlockMetaData } from '../../../../../src/indexer/models/block-meta-data';
import { ServiceFlow } from '../../../../../src/indexer/models/service-flow';
import { Service } from '../../../../../src/indexer/models/service/service';

jest.mock('../../../../../src/indexer/models/service/service');

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
      const _servicesCreatedCommand: ServiceCreatedCommand =
        new ServiceCreatedCommand([SERVICES_PARAM], mockBlockNumber());
      /* eslint-enable */
      expect(Service).toHaveBeenCalled();
      expect(Service).toHaveBeenCalledWith(SERVICES_PARAM.toHuman());
      expect(SERVICES_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _servicesCreatedCommand: ServiceCreatedCommand =
          new ServiceCreatedCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Services Updated Command', () => {
    it('should called model data and toHuman', () => {
      const SERVICES_PARAM = createMockService();

      /* eslint-disable */
      const _servicesUpdatedCommand: ServiceUpdatedCommand =
        new ServiceUpdatedCommand([SERVICES_PARAM], mockBlockNumber());
      /* eslint-enable */
      expect(Service).toHaveBeenCalled();
      expect(Service).toHaveBeenCalledWith(SERVICES_PARAM.toHuman());
      expect(SERVICES_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _servicesUpdatedCommand: ServiceUpdatedCommand =
          new ServiceUpdatedCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Services Deleted Command', () => {
    it('should called model data and toHuman', () => {
      const SERVICES_PARAM = createMockService();

      /* eslint-disable */
      const _servicesDeletedCommand: ServiceDeletedCommand =
        new ServiceDeletedCommand([SERVICES_PARAM], mockBlockNumber());
      /* eslint-enable */
      expect(Service).toHaveBeenCalled();
      expect(Service).toHaveBeenCalledWith(SERVICES_PARAM.toHuman());
      expect(SERVICES_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _servicesDeletedCommand: ServiceDeletedCommand =
          new ServiceDeletedCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });
});
