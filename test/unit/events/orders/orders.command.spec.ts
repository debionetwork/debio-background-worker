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
import { CommonModule } from "../../../../src/common/common.module";
import { OrderStatus } from "../../../../src/substrate/events/orders/models/order-status";
import { Currency } from "../../../../src/substrate/events/orders/models/currency";
import { BlockMetaData } from "../../../../src/substrate/models/blockMetaData";
import {
	ElasticsearchModule,
	ElasticsearchService
} from "@nestjs/elasticsearch";
import {
	CommandBus, CqrsModule
} from "@nestjs/cqrs";
import {
	Test,
	TestingModule
} from "@nestjs/testing";
import { 
	SubstrateController, 
	SubstrateService 
} from "../../../../src/substrate/substrate.handler";
import { 
	CommandBusProvider, 
	ElasticSearchServiceProvider, 
	substrateServiceProvider 
} from "../../mock";

let orderCancelledHandler: OrderCancelledHandler;
let orderCreatedHandler: OrderCreatedHandler;
let orderFailedHandler: OrderFailedHandler;
let orderFulfilledHandler: OrderFulfilledHandler;
let orderPaidHandler: OrderPaidHandler;
let orderRefundedHandler: OrderRefundedHandler;

let commandBus: CommandBus;

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

		commandBus						= modules.get<CommandBus>(CommandBus);

		await modules.init();
  });

  describe("Lab Handler", () => {
		it("Lab cancelled handler defined", () => {
			expect(orderCancelledHandler).toBeDefined();
		});
		
		it("Lab created handler defined", () => {
			expect(orderCreatedHandler).toBeDefined();
		});
		
		it("Lab failed handler defined", () => {
			expect(orderFailedHandler).toBeDefined();
		});
		
		it("Lab fulfilled status handler defined", () => {
			expect(orderFulfilledHandler).toBeDefined();
		});
		
		it("Lab paid status handler defined", () => {
			expect(orderPaidHandler).toBeDefined();
		});
		
		it("Lab refunded status handler defined", () => {
			expect(orderRefundedHandler).toBeDefined();
		});
	});
  
	describe("Order Command", () => {
		it("Order Cancelled Command", async () => {
			const order = createMockOrder(OrderStatus.Cancelled);

			const orderCancelledHandlerSpy = jest.spyOn(orderCancelledHandler, 'execute');

			const orderCancelledCommand: OrderCancelledCommand = new OrderCancelledCommand([order], mockBlockNumber());

			await commandBus.execute(orderCancelledCommand);
			expect(orderCancelledHandlerSpy).toBeCalled();
			expect(orderCancelledHandlerSpy).toBeCalledWith(orderCancelledCommand);
		});

		it("Order Created Command", async () => {
			const order = createMockOrder(OrderStatus.Unpaid);
			
			const orderCreatedHandlerSpy = jest.spyOn(orderCreatedHandler, 'execute');

			const orderCreatedCommand: OrderCreatedCommand = new OrderCreatedCommand([order], mockBlockNumber());

			await commandBus.execute(orderCreatedCommand);
			expect(orderCreatedHandlerSpy).toBeCalled();
			expect(orderCreatedHandlerSpy).toBeCalledWith(orderCreatedCommand);
		});

		it("Order Failed Command", async () => {
			const order = createMockOrder(OrderStatus.Failed);
			
			const orderFailedHandlerSpy = jest.spyOn(orderFailedHandler, 'execute');

			const orderFailedCommand: OrderFailedCommand = new OrderFailedCommand([order], mockBlockNumber());

			await commandBus.execute(orderFailedCommand);
			expect(orderFailedHandlerSpy).toBeCalled();
			expect(orderFailedHandlerSpy).toBeCalledWith(orderFailedCommand);
		});

		it("Order Fulfilled Command", async () => {
			const order = createMockOrder(OrderStatus.Failed);
			
			const orderFulfilledHandlerSpy = jest.spyOn(orderFulfilledHandler, 'execute');

			const orderFulfilledCommand: OrderFulfilledCommand = new OrderFulfilledCommand([order], mockBlockNumber());

			await commandBus.execute(orderFulfilledCommand);
			expect(orderFulfilledHandlerSpy).toBeCalled();
			expect(orderFulfilledHandlerSpy).toBeCalledWith(orderFulfilledCommand);
		});

		it("Order Paid Command", async () => {
			const order = createMockOrder(OrderStatus.Paid);
			
			const orderPaidHandlerSpy = jest.spyOn(orderPaidHandler, 'execute');

			const orderPaidCommand: OrderPaidCommand = new OrderPaidCommand([order], mockBlockNumber());

			await commandBus.execute(orderPaidCommand);
			expect(orderPaidHandlerSpy).toBeCalled();
			expect(orderPaidHandlerSpy).toBeCalledWith(orderPaidCommand);
		});

		it("Order Refunded Command", async () => {
			const order = createMockOrder(OrderStatus.Refunded);
			
			const orderRefundedHandlerSpy = jest.spyOn(orderRefundedHandler, 'execute');

			const orderRefundedCommand: OrderRefundedCommand = new OrderRefundedCommand([order], mockBlockNumber());

			await commandBus.execute(orderRefundedCommand);
			expect(orderRefundedHandlerSpy).toBeCalled();
			expect(orderRefundedHandlerSpy).toBeCalledWith(orderRefundedCommand);
		});
	});
});