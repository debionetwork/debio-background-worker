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
			blockHash: "string",
			blockNumber: 1,
		}
	}
  
  beforeAll(async () => {
    const modules: TestingModule = await Test.createTestingModule({
			imports: [
				CommonModule,
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