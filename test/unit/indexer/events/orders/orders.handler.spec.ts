import {
  OrderCancelledCommandIndexer,
  OrderCommandHandlers,
  OrderCreatedCommandIndexer,
  OrderFailedCommandIndexer,
  OrderFulfilledCommandIndexer,
  OrderPaidCommandIndexer,
  OrderRefundedCommandIndexer,
} from '@indexer/events/orders';
import { OrderCancelledHandler } from '@indexer/events/orders/commands/order-cancelled/order-cancelled.handler';
import { OrderCreatedHandler } from '@indexer/events/orders/commands/order-created/order-created.handler';
import { OrderFailedHandler } from '@indexer/events/orders/commands/order-failed/order-failed.handler';
import { OrderFulfilledHandler } from '@indexer/events/orders/commands/order-fulfilled/order-fulfilled.handler';
import { OrderPaidHandler } from '@indexer/events/orders/commands/order-paid/order-paid.handler';
import { OrderRefundedHandler } from '@indexer/events/orders/commands/order-refunded/order-refunded.handler';
import { OrderStatus } from '@indexer/models/order/order-status';
import { Currency } from '@indexer/models/order/currency';
import { BlockMetaData } from '@indexer/models/block-meta-data';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createObjectSearchLab,
  createObjectSearchService,
  ElasticSearchServiceProvider,
} from '../../../mock';
import { when } from 'jest-when';

let orderCancelledHandler: OrderCancelledHandler;
let orderCreatedHandler: OrderCreatedHandler;
let orderFailedHandler: OrderFailedHandler;
let orderFulfilledHandler: OrderFulfilledHandler;
let orderPaidHandler: OrderPaidHandler;
let orderRefundedHandler: OrderRefundedHandler;

let elasticsearchService: ElasticsearchService;

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
      blockHash: '',
      blockNumber: 1,
    };
  }

  beforeAll(async () => {
    const modules: TestingModule = await Test.createTestingModule({
      providers: [ElasticSearchServiceProvider, ...OrderCommandHandlers],
    }).compile();

    orderCancelledHandler = modules.get<OrderCancelledHandler>(
      OrderCancelledHandler,
    );
    orderCreatedHandler = modules.get<OrderCreatedHandler>(OrderCreatedHandler);
    orderFailedHandler = modules.get<OrderFailedHandler>(OrderFailedHandler);
    orderFulfilledHandler = modules.get<OrderFulfilledHandler>(
      OrderFulfilledHandler,
    );
    orderPaidHandler = modules.get<OrderPaidHandler>(OrderPaidHandler);
    orderRefundedHandler =
      modules.get<OrderRefundedHandler>(OrderRefundedHandler);

    elasticsearchService =
      modules.get<ElasticsearchService>(ElasticsearchService);

    await modules.init();
  });

  describe('Order Handler', () => {
    it('Order Cancelled Handler', async () => {
      const order = createMockOrder(OrderStatus.Cancelled);

      const orderCancelledCommand: OrderCancelledCommandIndexer =
        new OrderCancelledCommandIndexer([order], mockBlockNumber());

      await orderCancelledHandler.execute(orderCancelledCommand);
      expect(elasticsearchService.update).toHaveBeenCalled();
    });

    it('Order Created Handler', async () => {
      const order = createMockOrder(OrderStatus.Cancelled);
      const LAB_ID = 'string';
      const LAB_CALLED_WITH = createObjectSearchLab(LAB_ID);
      const ES_RESULT_LAB = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  info: {},
                },
              },
            ],
          },
        },
      };
      const SERVICE_ID = 'string';
      const SERVICE_CALLED_WITH = createObjectSearchService(SERVICE_ID);
      const ES_RESULT_SERVICE = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  info: {},
                },
              },
            ],
          },
        },
      };

      when(elasticsearchService.search)
        .calledWith(LAB_CALLED_WITH)
        .mockReturnValue(ES_RESULT_LAB);

      when(elasticsearchService.search)
        .calledWith(SERVICE_CALLED_WITH)
        .mockReturnValue(ES_RESULT_SERVICE);

      const orderCreatedCommand: OrderCreatedCommandIndexer =
        new OrderCreatedCommandIndexer([order], mockBlockNumber());

      await orderCreatedHandler.execute(orderCreatedCommand);
      expect(elasticsearchService.search).toHaveBeenCalledTimes(2);
      expect(elasticsearchService.index).toHaveBeenCalled();
    });

    it('Order Failed Handler', async () => {
      const order = createMockOrder(OrderStatus.Cancelled);

      const orderFailedCommand: OrderFailedCommandIndexer =
        new OrderFailedCommandIndexer([order], mockBlockNumber());

      await orderFailedHandler.execute(orderFailedCommand);
      expect(elasticsearchService.update).toHaveBeenCalled();
    });

    it('Order Fulfilled Handler', async () => {
      const order = createMockOrder(OrderStatus.Cancelled);

      const orderFulfilledCommand: OrderFulfilledCommandIndexer =
        new OrderFulfilledCommandIndexer([order], mockBlockNumber());

      await orderFulfilledHandler.execute(orderFulfilledCommand);
      expect(elasticsearchService.update).toHaveBeenCalled();
    });

    it('Order Paid Handler', async () => {
      const order = createMockOrder(OrderStatus.Cancelled);

      const orderPaidCommand: OrderPaidCommandIndexer =
        new OrderPaidCommandIndexer([order], mockBlockNumber());

      await orderPaidHandler.execute(orderPaidCommand);
      expect(elasticsearchService.update).toHaveBeenCalled();
    });

    it('Order Refunded Handler', async () => {
      const order = createMockOrder(OrderStatus.Cancelled);

      const orderRefundedCommand: OrderRefundedCommandIndexer =
        new OrderRefundedCommandIndexer([order], mockBlockNumber());

      await orderRefundedHandler.execute(orderRefundedCommand);
      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });
});
