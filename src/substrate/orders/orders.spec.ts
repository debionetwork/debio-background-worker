import { 
	OrderCancelledCommand, 
	OrderCommandHandlers, 
	OrderCreatedCommand, 
	OrderFailedCommand, 
	OrderFulfilledCommand, 
	OrderPaidCommand, 
	OrderRefundedCommand 
} from ".";
import { OrderCancelledHandler } from "./commands/order-cancelled/order-cancelled.handler";
import { OrderCreatedHandler } from "./commands/order-created/order-created.handler";
import { OrderFailedHandler } from "./commands/order-failed/order-failed.handler";
import { OrderFulfilledHandler } from "./commands/order-fulfilled/order-fulfilled.handler";
import { OrderPaidHandler } from "./commands/order-paid/order-paid.handler";
import { OrderRefundedHandler } from "./commands/order-refunded/order-refunded.handler";
import { CommonModule } from "../../common/common.module";
import { OrderStatus } from "./models/order-status";
import { Orders } from "./models/orders";
import { Price } from "../services/models/price";
import { Currency } from "./models/currency";
import { BlockMetaData } from "../models/blockMetaData";
import { 
	ElasticsearchModule, 
	ElasticsearchService 
} from "@nestjs/elasticsearch";
import { 
	SubstrateController, 
	SubstrateService 
} from "../substrate.handler";
import { 
	CommandBus, 
	CqrsModule 
} from "@nestjs/cqrs";
import { 
	Test, 
	TestingModule 
} from "@nestjs/testing";

describe("Orders Substrate Event Handler", () => {
	let orderCancelledHandler: OrderCancelledHandler;
	let orderCreatedHandler: OrderCreatedHandler;
	let orderFailedHandler: OrderFailedHandler;
	let orderFulfilledHandler: OrderFulfilledHandler;
	let orderPaidHandler: OrderPaidHandler;
	let orderRefundedHandler: OrderRefundedHandler;

	const substrateServiceProvider = {
		provide: SubstrateService,
		useFactory: () => ({
			handleEvent: jest.fn(),
			listenToEvents: jest.fn(),
			listenToNewBlock: jest.fn(),
			syncBlock: jest.fn(),
		})
	}

	const CommandBusProvider = {
		provide: CommandBus,
		useFactory: () => ({
			execute: jest.fn(),
		})
	}

	const ElasticSearchServiceProvider = {
		provide: ElasticsearchService,
		useFactory: () => ({
			indices: {
				delete: jest.fn(),
			},
			delete: jest.fn(
				() => ({
					catch: jest.fn(),
				})
			),
			deleteByQuery: jest.fn(
				() => ({
					catch: jest.fn(),
				})
			),
			index: jest.fn(
				() => ({
					catch: jest.fn(),
				})
			),
			update: jest.fn(
				() => ({
					catch: jest.fn(),
				})
			),
			updateByQuery: jest.fn(
				() => ({
					catch: jest.fn(),
				})
			),
			search: jest.fn(
				() => ({
					body: {
						hits: {
							hits: [
								{
									_source: {
										info: {}
									}
								}
							]
						}
					},
					catch: jest.fn(),
				})
			),
		})
	}
  
	function createMockOrder(status: OrderStatus) {
		const first_price = {
			component: "testing_price", 
			value: 15
		};
		const second_price = {
			component: "qc_price", 
			value: 5
		};

		const order = {
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
			imports: [
				CommonModule,
				ElasticsearchModule.registerAsync({
					useFactory: async () => ({
						node: process.env.ELASTICSEARCH_NODE,
					}),
				}),
				CqrsModule,
			],
			controllers: [
        SubstrateController
      ],
      providers: [
				ElasticsearchService,
				ElasticSearchServiceProvider,
				SubstrateService, 
				substrateServiceProvider, 
				CommandBus, 
				CommandBusProvider,
				...OrderCommandHandlers,
      ]
    }).compile();
    
		orderCancelledHandler = modules.get<OrderCancelledHandler>(OrderCancelledHandler);
		orderCreatedHandler 	= modules.get<OrderCreatedHandler>(OrderCreatedHandler);
		orderFailedHandler 		= modules.get<OrderFailedHandler>(OrderFailedHandler);
		orderFulfilledHandler = modules.get<OrderFulfilledHandler>(OrderFulfilledHandler);
		orderPaidHandler 			= modules.get<OrderPaidHandler>(OrderPaidHandler);
		orderRefundedHandler 	= modules.get<OrderRefundedHandler>(OrderRefundedHandler);
  });
  
	describe("Order Handler", () => {
		it("Order Cancelled Handler", async () => {
			const order = createMockOrder(OrderStatus.Cancelled);
			
			const orderCancelledHandlerSpy = jest.spyOn(orderCancelledHandler, 'execute');
			const orderCancelledCommand: OrderCancelledCommand = new OrderCancelledCommand([order], mockBlockNumber());
			await orderCancelledHandler.execute(orderCancelledCommand);
			expect(orderCancelledHandlerSpy).toBeCalled();
			expect(orderCancelledHandlerSpy).toBeCalledWith(orderCancelledCommand);
		});

		it("Order Created Handler", async () => {
			const order = createMockOrder(OrderStatus.Unpaid);
			
			const orderCreatedHandlerSpy = jest.spyOn(orderCreatedHandler, 'execute');
			const orderCreatedCommand: OrderCreatedCommand = new OrderCreatedCommand([order], mockBlockNumber());
			await orderCreatedHandler.execute(orderCreatedCommand);
			expect(orderCreatedHandlerSpy).toBeCalled();
			expect(orderCreatedHandlerSpy).toBeCalledWith(orderCreatedCommand);
		});

		it("Order Failed Handler", async () => {
			const order = createMockOrder(OrderStatus.Failed);
			
			const orderFailedHandlerSpy = jest.spyOn(orderFailedHandler, 'execute');
			const orderFailedCommand: OrderFailedCommand = new OrderFailedCommand([order], mockBlockNumber());
			await orderFailedHandler.execute(orderFailedCommand);
			expect(orderFailedHandlerSpy).toBeCalled();
			expect(orderFailedHandlerSpy).toBeCalledWith(orderFailedCommand);
		});

		it("Order Fulfilled Handler", async () => {
			const order = createMockOrder(OrderStatus.Failed);
			
			const orderFulfilledHandlerSpy = jest.spyOn(orderFulfilledHandler, 'execute');
			const orderFulfilledCommand: OrderFulfilledCommand = new OrderFulfilledCommand([order], mockBlockNumber());
			await orderFulfilledHandler.execute(orderFulfilledCommand);
			expect(orderFulfilledHandlerSpy).toBeCalled();
			expect(orderFulfilledHandlerSpy).toBeCalledWith(orderFulfilledCommand);
		});

		it("Order Paid Handler", async () => {
			const order = createMockOrder(OrderStatus.Paid);
			
			const orderPaidHandlerSpy = jest.spyOn(orderPaidHandler, 'execute');
			const orderPaidCommand: OrderPaidCommand = new OrderPaidCommand([order], mockBlockNumber());
			await orderPaidHandler.execute(orderPaidCommand);
			expect(orderPaidHandlerSpy).toBeCalled();
			expect(orderPaidHandlerSpy).toBeCalledWith(orderPaidCommand);
		});

		it("Order Refunded Handler", async () => {
			const order = createMockOrder(OrderStatus.Refunded);
			
			const orderRefundedHandlerSpy = jest.spyOn(orderRefundedHandler, 'execute');
			const orderRefundedCommand: OrderRefundedCommand = new OrderRefundedCommand([order], mockBlockNumber());
			await orderRefundedHandler.execute(orderRefundedCommand);
			expect(orderRefundedHandlerSpy).toBeCalled();
			expect(orderRefundedHandlerSpy).toBeCalledWith(orderRefundedCommand);
		});
	});
});