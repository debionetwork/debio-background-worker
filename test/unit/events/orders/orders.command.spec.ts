import {
  OrderCancelledCommand,
  OrderCreatedCommand,
  OrderFailedCommand,
  OrderFulfilledCommand,
  OrderPaidCommand,
  OrderRefundedCommand,
} from '../../../../src/substrate/events/orders';
import { OrderStatus } from '../../../../src/substrate/events/orders/models/order-status';
import { Currency } from '../../../../src/substrate/events/orders/models/currency';
import { BlockMetaData } from '../../../../src/substrate/models/blockMetaData';
import { Orders } from '../../../../src/substrate/events/orders/models/orders';

jest.mock('../../../../src/substrate/events/orders/models/orders');

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

      const _orderCreatedCommand: OrderCreatedCommand = new OrderCreatedCommand(
        [ORDER_PARAM],
        mockBlockNumber(),
      );
      expect(Orders).toHaveBeenCalled();
      expect(Orders).toHaveBeenCalledWith(ORDER_PARAM.toHuman());
      expect(ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _orderCreatedCommand: OrderCreatedCommand =
          new OrderCreatedCommand([{}], mockBlockNumber());
      }).toThrowError();
    });
  });

  describe('Order Cancelled Command', () => {
    it('should called model data and toHuman', () => {
      const ORDER_PARAM = createMockOrder(OrderStatus.Cancelled);

      const _orderCancelledCommand: OrderCancelledCommand =
        new OrderCancelledCommand([ORDER_PARAM], mockBlockNumber());
      expect(Orders).toHaveBeenCalled();
      expect(Orders).toHaveBeenCalledWith(ORDER_PARAM.toHuman());
      expect(ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _orderCancelledCommand: OrderCancelledCommand =
          new OrderCancelledCommand([{}], mockBlockNumber());
      }).toThrowError();
    });
  });

  describe('Orders Failed Command', () => {
    it('should called model data and toHuman', () => {
      const ORDER_PARAM = createMockOrder(OrderStatus.Failed);

      const _orderFailedCommand: OrderFailedCommand = new OrderFailedCommand(
        [ORDER_PARAM],
        mockBlockNumber(),
      );
      expect(Orders).toHaveBeenCalled();
      expect(Orders).toHaveBeenCalledWith(ORDER_PARAM.toHuman());
      expect(ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _orderFailedCommand: OrderFailedCommand = new OrderFailedCommand(
          [{}],
          mockBlockNumber(),
        );
      }).toThrowError();
    });
  });

  describe('Orders Fulfilled Command', () => {
    it('should called model data and toHuman', () => {
      const ORDER_PARAM = createMockOrder(OrderStatus.Fulfilled);

      const _orderFulfilledCommand: OrderFulfilledCommand =
        new OrderFulfilledCommand([ORDER_PARAM], mockBlockNumber());
      expect(Orders).toHaveBeenCalled();
      expect(Orders).toHaveBeenCalledWith(ORDER_PARAM.toHuman());
      expect(ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _orderFulfilledCommand: OrderFulfilledCommand =
          new OrderFulfilledCommand([{}], mockBlockNumber());
      }).toThrowError();
    });
  });

  describe('Orders Paid Command', () => {
    it('should called model data and toHuman', () => {
      const ORDER_PARAM = createMockOrder(OrderStatus.Paid);

      const _orderPaidCommand: OrderPaidCommand = new OrderPaidCommand(
        [ORDER_PARAM],
        mockBlockNumber(),
      );
      expect(Orders).toHaveBeenCalled();
      expect(Orders).toHaveBeenCalledWith(ORDER_PARAM.toHuman());
      expect(ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _orderPaidCommand: OrderPaidCommand = new OrderPaidCommand(
          [{}],
          mockBlockNumber(),
        );
      }).toThrowError();
    });
  });

  describe('Orders Refunded Command', () => {
    it('should called model data and toHuman', () => {
      const ORDER_PARAM = createMockOrder(OrderStatus.Refunded);

      const _orderRefundedCommand: OrderRefundedCommand =
        new OrderRefundedCommand([ORDER_PARAM], mockBlockNumber());
      expect(Orders).toHaveBeenCalled();
      expect(Orders).toHaveBeenCalledWith(ORDER_PARAM.toHuman());
      expect(ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _orderRefundedCommand: OrderRefundedCommand =
          new OrderRefundedCommand([{}], mockBlockNumber());
      }).toThrowError();
    });
  });
});