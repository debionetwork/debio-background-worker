import {
  ServiceCreatedCommand,
  ServiceDeletedCommand,
  ServiceUpdatedCommand,
} from '../../../../src/substrate/events/services';
import { BlockMetaData } from '../../../../src/substrate/models/blockMetaData';
import { ServiceFlow } from '../../../../src/substrate/models/service-flow';
import { Service } from '../../../../src/substrate/events/services/models/service';

jest.mock('../../../../src/substrate/events/services/models/service');

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

      const _servicesCreatedCommand: ServiceCreatedCommand =
        new ServiceCreatedCommand([SERVICES_PARAM], mockBlockNumber());
      expect(Service).toHaveBeenCalled();
      expect(Service).toHaveBeenCalledWith(SERVICES_PARAM.toHuman());
      expect(SERVICES_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _servicesCreatedCommand: ServiceCreatedCommand =
          new ServiceCreatedCommand([{}], mockBlockNumber());
      }).toThrowError();
    });
  });

  describe('Services Updated Command', () => {
    it('should called model data and toHuman', () => {
      const SERVICES_PARAM = createMockService();

      const _servicesUpdatedCommand: ServiceUpdatedCommand =
        new ServiceUpdatedCommand([SERVICES_PARAM], mockBlockNumber());
      expect(Service).toHaveBeenCalled();
      expect(Service).toHaveBeenCalledWith(SERVICES_PARAM.toHuman());
      expect(SERVICES_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _servicesUpdatedCommand: ServiceUpdatedCommand =
          new ServiceUpdatedCommand([{}], mockBlockNumber());
      }).toThrowError();
    });
  });

  describe('Services Deleted Command', () => {
    it('should called model data and toHuman', () => {
      const SERVICES_PARAM = createMockService();

      const _servicesDeletedCommand: ServiceDeletedCommand =
        new ServiceDeletedCommand([SERVICES_PARAM], mockBlockNumber());
      expect(Service).toHaveBeenCalled();
      expect(Service).toHaveBeenCalledWith(SERVICES_PARAM.toHuman());
      expect(SERVICES_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _servicesDeletedCommand: ServiceDeletedCommand =
          new ServiceDeletedCommand([{}], mockBlockNumber());
      }).toThrowError();
    });
  });
});
