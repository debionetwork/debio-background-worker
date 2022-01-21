import {
	OrderCancelledCommand,
	OrderCommandHandlers,
	OrderCreatedCommand,
	OrderFailedCommand,
	OrderFulfilledCommand,
	OrderPaidCommand,
	OrderRefundedCommand
} from "../../../../src/substrate/events/orders";
import { OrderCancelledHandler } from "../../../../src/substrate/events/orders/commands/order-cancelled/order-cancelled.handler";
import { OrderCreatedHandler } from "../../../../src/substrate/events/orders/commands/order-created/order-created.handler";
import { OrderFailedHandler } from "../../../../src/substrate/events/orders/commands/order-failed/order-failed.handler";
import { OrderFulfilledHandler } from "../../../../src/substrate/events/orders/commands/order-fulfilled/order-fulfilled.handler";
import { OrderPaidHandler } from "../../../../src/substrate/events/orders/commands/order-paid/order-paid.handler";
import { OrderRefundedHandler } from "../../../../src/substrate/events/orders/commands/order-refunded/order-refunded.handler";
import { OrderStatus } from "../../../../src/substrate/events/orders/models/order-status";
import { Currency } from "../../../../src/substrate/events/orders/models/currency";
import { BlockMetaData } from "../../../../src/substrate/models/blockMetaData";
import {
	ElasticsearchService
} from "@nestjs/elasticsearch";
import {
	Test,
	TestingModule
} from "@nestjs/testing";
import { ElasticSearchServiceProvider } from "../../mock";

let orderCancelledHandler: OrderCancelledHandler;
let orderCreatedHandler: OrderCreatedHandler;
let orderFailedHandler: OrderFailedHandler;
let orderFulfilledHandler: OrderFulfilledHandler;
let orderPaidHandler: OrderPaidHandler;
let orderRefundedHandler: OrderRefundedHandler;

let elasticsearchService: ElasticsearchService;

describe("Orders Substrate Event Handler", () => {
	function createMockOrder(status: OrderStatus) {
		const first_price = {
			component: "string", 
			value: 1
		};
		const second_price = {
			component: "string", 
			value: 1
		};

		return {
			toHuman: jest.fn(
				() => ({
					id: "string",
					serviceId: "string",
					customerId: "string",
					customerBoxPublicKey: "string",
					sellerId: "string",
					dnaSampleTrackingId: "string",
					currency: Currency.DAI,
					prices: [ first_price ],
					additionalPrices: [ second_price ],
					status: status,
					orderFlow: "1",
					createdAt: "1",
					updatedAt: "1"
				})
			)
		};
	}

	function mockBlockNumber(): BlockMetaData {
		return {
			blockHash: "",
			blockNumber: 1,
		}
	}
  
  beforeAll(async () => {
    const modules: TestingModule = await Test.createTestingModule({
      providers: [
				ElasticsearchService,
				ElasticSearchServiceProvider,
				...OrderCommandHandlers,
      ]
    }).compile();
    
		orderCancelledHandler = modules.get<OrderCancelledHandler>(OrderCancelledHandler);
		orderCreatedHandler 	= modules.get<OrderCreatedHandler>(OrderCreatedHandler);
		orderFailedHandler 		= modules.get<OrderFailedHandler>(OrderFailedHandler);
		orderFulfilledHandler = modules.get<OrderFulfilledHandler>(OrderFulfilledHandler);
		orderPaidHandler 			= modules.get<OrderPaidHandler>(OrderPaidHandler);
		orderRefundedHandler 	= modules.get<OrderRefundedHandler>(OrderRefundedHandler);

		elasticsearchService 	= modules.get<ElasticsearchService>(ElasticsearchService);

		await modules.init();
  });
  
	describe("Order Handler", () => {
		it("Order Cancelled Handler", async () => {
			const order = createMockOrder(OrderStatus.Cancelled);

			const orderCancelledCommand: OrderCancelledCommand = new OrderCancelledCommand([order], mockBlockNumber());
			
			await orderCancelledHandler.execute(orderCancelledCommand);
			expect(elasticsearchService.update).toHaveBeenCalled();
		});
    
		it("Order Created Handler", async () => {
			const order = createMockOrder(OrderStatus.Cancelled);

			const orderCreatedCommand: OrderCreatedCommand = new OrderCreatedCommand([order], mockBlockNumber());
			
			await orderCreatedHandler.execute(orderCreatedCommand);
			expect(elasticsearchService.search).toHaveBeenCalledTimes(2);
			expect(elasticsearchService.index).toHaveBeenCalled();
		});
    
		it("Order Failed Handler", async () => {
			const order = createMockOrder(OrderStatus.Cancelled);

			const orderFailedCommand: OrderFailedCommand = new OrderFailedCommand([order], mockBlockNumber());
			
			await orderFailedHandler.execute(orderFailedCommand);
			expect(elasticsearchService.update).toHaveBeenCalled();
		});
    
		it("Order Fulfilled Handler", async () => {
			const order = createMockOrder(OrderStatus.Cancelled);

			const orderFulfilledCommand: OrderFulfilledCommand = new OrderFulfilledCommand([order], mockBlockNumber());
			
			await orderFulfilledHandler.execute(orderFulfilledCommand);
			expect(elasticsearchService.update).toHaveBeenCalled();
		});
    
		it("Order Paid Handler", async () => {
			const order = createMockOrder(OrderStatus.Cancelled);

			const orderPaidCommand: OrderPaidCommand = new OrderPaidCommand([order], mockBlockNumber());
			
			await orderPaidHandler.execute(orderPaidCommand);
			expect(elasticsearchService.update).toHaveBeenCalled();
		});

		it("Order Refunded Handler", async () => {
			const order = createMockOrder(OrderStatus.Cancelled);

			const orderRefundedCommand: OrderRefundedCommand = new OrderRefundedCommand([order], mockBlockNumber());

			await orderRefundedHandler.execute(orderRefundedCommand);
			expect(elasticsearchService.update).toHaveBeenCalled();
		});
	});
});