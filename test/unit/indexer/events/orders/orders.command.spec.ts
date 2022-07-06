import {
  OrderCancelledCommand,
  OrderCreatedCommand,
  OrderFailedCommand,
  OrderFulfilledCommand,
  OrderPaidCommand,
  OrderRefundedCommand,
} from '../../../../../src/indexer/events/orders';
import { OrderStatus } from '../../../../../src/indexer/models/order/order-status';
import { Currency } from '../../../../../src/indexer/models/order/currency';
import { BlockMetaData } from '../../../../../src/indexer/models/blockMetaData';
import { Orders } from '../../../../../src/indexer/models/order/orders';

jest.mock('../../../../../src/indexer/models/order/orders');

describe('Orders Substrate Event Handler', () => {
  function createMockOrder(status: OrderStatus) {
    const first_price = {
      component: 'string',
      value: 1,
    };
    const second_price = {
      component: 'string',
      value: 1,
    };

    return {
      toHuman: jest.fn(() => ({
        id: 'string',
        serviceId: 'string',
        customerId: 'string',
        customerBoxPublicKey: 'string',
        sellerId: 'string',
        dnaSampleTrackingId: 'string',
        currency: Currency.DAI,
        prices: [first_price],
        additionalPrices: [second_price],
        status: status,
        orderFlow: '1',
        createdAt: '1',
        updatedAt: '1',
      })),
    };
  }

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: 'string',
      blockNumber: 1,
    };
  }

  describe('Orders Created Command', () => {
    it('should called model data and toHuman', () => {
      const ORDER_PARAM = createMockOrder(OrderStatus.Unpaid);

      /* eslint-disable */
      const _orderCreatedCommand: OrderCreatedCommand = new OrderCreatedCommand(
        [ORDER_PARAM],
        mockBlockNumber(),
      );
      /* eslint-enable */
      expect(Orders).toHaveBeenCalled();
      expect(Orders).toHaveBeenCalledWith(ORDER_PARAM.toHuman());
      expect(ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _orderCreatedCommand: OrderCreatedCommand =
          new OrderCreatedCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Order Cancelled Command', () => {
    it('should called model data and toHuman', () => {
      const ORDER_PARAM = createMockOrder(OrderStatus.Cancelled);

      /* eslint-disable */
      const _orderCancelledCommand: OrderCancelledCommand =
        new OrderCancelledCommand([ORDER_PARAM], mockBlockNumber());
      /* eslint-enable */
      expect(Orders).toHaveBeenCalled();
      expect(Orders).toHaveBeenCalledWith(ORDER_PARAM.toHuman());
      expect(ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _orderCancelledCommand: OrderCancelledCommand =
          new OrderCancelledCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Orders Failed Command', () => {
    it('should called model data and toHuman', () => {
      const ORDER_PARAM = createMockOrder(OrderStatus.Failed);

      /* eslint-disable */
      const _orderFailedCommand: OrderFailedCommand = new OrderFailedCommand(
        [ORDER_PARAM],
        mockBlockNumber(),
      );
      /* eslint-enable */
      expect(Orders).toHaveBeenCalled();
      expect(Orders).toHaveBeenCalledWith(ORDER_PARAM.toHuman());
      expect(ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _orderFailedCommand: OrderFailedCommand = new OrderFailedCommand(
          [{}],
          mockBlockNumber(),
        );
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Orders Fulfilled Command', () => {
    it('should called model data and toHuman', () => {
      const ORDER_PARAM = createMockOrder(OrderStatus.Fulfilled);

      /* eslint-disable */
      const _orderFulfilledCommand: OrderFulfilledCommand =
        new OrderFulfilledCommand([ORDER_PARAM], mockBlockNumber());
      /* eslint-enable */
      expect(Orders).toHaveBeenCalled();
      expect(Orders).toHaveBeenCalledWith(ORDER_PARAM.toHuman());
      expect(ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _orderFulfilledCommand: OrderFulfilledCommand =
          new OrderFulfilledCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Orders Paid Command', () => {
    it('should called model data and toHuman', () => {
      const ORDER_PARAM = createMockOrder(OrderStatus.Paid);

      /* eslint-disable */
      const _orderPaidCommand: OrderPaidCommand = new OrderPaidCommand(
        [ORDER_PARAM],
        mockBlockNumber(),
      );
      /* eslint-enable */
      expect(Orders).toHaveBeenCalled();
      expect(Orders).toHaveBeenCalledWith(ORDER_PARAM.toHuman());
      expect(ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _orderPaidCommand: OrderPaidCommand = new OrderPaidCommand(
          [{}],
          mockBlockNumber(),
        );
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Orders Refunded Command', () => {
    it('should called model data and toHuman', () => {
      const ORDER_PARAM = createMockOrder(OrderStatus.Refunded);

      /* eslint-disable */
      const _orderRefundedCommand: OrderRefundedCommand =
        new OrderRefundedCommand([ORDER_PARAM], mockBlockNumber());
      /* eslint-enable */
      expect(Orders).toHaveBeenCalled();
      expect(Orders).toHaveBeenCalledWith(ORDER_PARAM.toHuman());
      expect(ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _orderRefundedCommand: OrderRefundedCommand =
          new OrderRefundedCommand([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });
});
