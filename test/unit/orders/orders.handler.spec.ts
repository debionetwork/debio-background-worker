import {
	OrderCancelledCommand,
	OrderCommandHandlers,
	OrderCreatedCommand,
	OrderFailedCommand,
	OrderFulfilledCommand,
	OrderPaidCommand,
	OrderRefundedCommand
} from "../../../src/substrate/orders";
import { OrderCancelledHandler } from "../../../src/substrate/orders/commands/order-cancelled/order-cancelled.handler";
import { OrderCreatedHandler } from "../../../src/substrate/orders/commands/order-created/order-created.handler";
import { OrderFailedHandler } from "../../../src/substrate/orders/commands/order-failed/order-failed.handler";
import { OrderFulfilledHandler } from "../../../src/substrate/orders/commands/order-fulfilled/order-fulfilled.handler";
import { OrderPaidHandler } from "../../../src/substrate/orders/commands/order-paid/order-paid.handler";
import { OrderRefundedHandler } from "../../../src/substrate/orders/commands/order-refunded/order-refunded.handler";
import { OrderStatus } from "../../../src/substrate/orders/models/order-status";
import { Currency } from "../../../src/substrate/orders/models/currency";
import { BlockMetaData } from "../../../src/substrate/models/blockMetaData";
import {
	ElasticsearchService
} from "@nestjs/elasticsearch";
import {
	Test,
	TestingModule
} from "@nestjs/testing";
import { ElasticSearchServiceProvider } from "../mock";

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
			component: "testing_price", 
			value: 15
		};
		const second_price = {
			component: "qc_price", 
			value: 5
		};

		return {
			toHuman: jest.fn(
				() => ({
					id: "0xff667c9c1d315f8871d7739236905404806e201930d555bcf91f786a4f34d253",
					serviceId: "0x713e03730daf4715aaf7b018d54a9855d08860ce12a3cc57b5bb7dc1bc1a9309",
					customerId: "5ESGhRuAhECXu96Pz9L8pwEEd1AeVhStXX67TWE1zHRuvJNU",
					customerBoxPublicKey: "0xe2829ff8b96c52401dc9f89c5ce77df95868b5c9da2b7f70f04be1e9f8c39a74",
					sellerId: "5ESGhRuAhECXu96Pz9L8pwEEd1AeVhStXX67TWE1zHRuvJNU",
					dnaSampleTrackingId: "29C78CYDIUT3H75Z3229C",
					currency: Currency.DAI,
					prices: [ first_price ],
					additionalPrices: [ second_price ],
					status: status,
					orderFlow: "",
					createdAt: "1632212142000",
					updatedAt: "1632212142000"
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