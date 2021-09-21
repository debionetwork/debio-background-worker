import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { Test, TestingModule } from "@nestjs/testing";
import { BlockCommandHandlers, BlockQueryHandlers } from "../ethereum/request-service/blocks";
import { CommonModule } from "../common/common.module";
import { DeleteAllIndexesHandler } from "./blocks/commands/delete-all-indexes/delete-all-indexes.handler";
import { SetLastSubstrateBlockHandler } from "./blocks/commands/set-last-substrate-block/set-last-substrate-block.handler";
import { LabCommandHandlers, LabDeregisteredCommand, LabRegisteredCommand, LabUpdatedCommand } from "./labs";
import { LabDeregisteredHandler } from "./labs/commands/lab-deregistered/lab-deregistered.handler";
import { LabRegisteredHandler } from "./labs/commands/lab-registered/lab-registered.handler";
import { LabUpdatedHandler } from "./labs/commands/lab-updated/lab-updated.handler";
import { Lab } from "./labs/models/lab";
import { LabInfo } from "./labs/models/lab-info";
import { OrderCancelledCommand, OrderCommandHandlers, OrderCreatedCommand, OrderFailedCommand, OrderFulfilledCommand, OrderPaidCommand, OrderRefundedCommand } from "./orders";
import { OrderCancelledHandler } from "./orders/commands/order-cancelled/order-cancelled.handler";
import { OrderCreatedHandler } from "./orders/commands/order-created/order-created.handler";
import { OrderFailedHandler } from "./orders/commands/order-failed/order-failed.handler";
import { OrderFulfilledHandler } from "./orders/commands/order-fulfilled/order-fulfilled.handler";
import { OrderPaidHandler } from "./orders/commands/order-paid/order-paid.handler";
import { OrderRefundedHandler } from "./orders/commands/order-refunded/order-refunded.handler";
import { ServiceCommandHandlers, ServiceCreatedCommand, ServiceDeletedCommand, ServiceUpdatedCommand } from "./services";
import { ServiceCreatedHandler } from "./services/commands/service-created/service-created.handler";
import { ServiceDeletedHandler } from "./services/commands/service-deleted/service-deleted.handler";
import { ServiceUpdatedHandler } from "./services/commands/service-updated/service-updated.handler";
import { SubstrateController, SubstrateService } from "./substrate.handler";
import { ElasticsearchModule, ElasticsearchService } from "@nestjs/elasticsearch";
import { Price } from "./services/models/price";
import { PriceByCurrency } from "./services/models/price-by-currency";
import { ServiceInfo } from "./services/models/service-info";
import { Service as Services } from "./services/models/service";
import { Orders } from "./orders/models/orders";
import { Currency } from "./orders/models/currency";
import { OrderStatus } from "./orders/models/order-status";
import { GetLastSubstrateBlockHandler } from "./blocks/queries/get-last-substrate-block/get-last-substrate-block.handler";
import { SetLastSubstrateBlockCommand } from "./blocks";

describe("Substrate Indexer", () => {
	let substrateController: SubstrateController;
	let substrateService: SubstrateService;
	let commandBus: CommandBus;
	let labDeregisteredHandler: LabDeregisteredHandler;
	let labRegisteredHandler: LabRegisteredHandler;
	let labUpdatedHandler: LabUpdatedHandler;
	let serviceCreatedHandler: ServiceCreatedHandler;
	let serviceDeletedHandler: ServiceDeletedHandler;
	let serviceUpdatedHandler: ServiceUpdatedHandler;
	let orderCancelledHandler: OrderCancelledHandler;
	let orderCreatedHandler: OrderCreatedHandler;
	let orderFailedHandler: OrderFailedHandler;
	let orderFulfilledHandler: OrderFulfilledHandler;
	let orderPaidHandler: OrderPaidHandler;
	let orderRefundedHandler: OrderRefundedHandler;
	let deleteAllIndexesHandler: DeleteAllIndexesHandler;
	let setLastSubstrateBlockHandler: SetLastSubstrateBlockHandler;
	let getLastSubstrateBlockHandler: GetLastSubstrateBlockHandler;

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

	const createMockLab = ({
		address,
		box_public_key,
		city,
		country,
		email,
		latitude,
		longitude,
		name,
		profile_image,
		region,
		account_id,
		certifications,
		services,
	}) => {
		const labInfo: LabInfo = new LabInfo();
		labInfo.address = address;
		labInfo.box_public_key = box_public_key;
		labInfo.city = city;
		labInfo.country = country;
		labInfo.email = email;
		labInfo.latitude = latitude;
		labInfo.longitude = longitude;
		labInfo.name = name;
		labInfo.profile_image = profile_image;
		labInfo.region = region;
		const lab: Lab = new Lab();
		lab.account_id = account_id;
		lab.certifications = certifications;
		lab.info = labInfo;
		lab.services = services;

		return lab;
	}

	function createMockService(): Services {
		const first_price: Price = new Price();
		first_price.component = "testing_price";
		first_price.value = 15;
		const second_price: Price = new Price();
		second_price.component = "qc_price";
		second_price.value = 5;

		const prices_by_currency: PriceByCurrency = new PriceByCurrency();
		prices_by_currency.currency = "Dai";
		prices_by_currency.total_price = 20;
		prices_by_currency.price_components = [ first_price ];
		prices_by_currency.additional_prices = [ second_price ];

		const service_info: ServiceInfo = new ServiceInfo();
		service_info.name = "Exercise";
		service_info.prices_by_currency = [ prices_by_currency ];
		service_info.expected_duration = "";
		service_info.category = "Targeted Gene Panel Sequencing";
		service_info.description = "Find an effective workout based on your genetic code to maximize your workout gains.";
		service_info.test_result_sample = "";
		service_info.long_description = null;
		service_info.image = "mdi-weight-lifter";
		service_info.dna_collection_process = null;

		const service: Services = new Services();
		service.info = service_info;
		service.id = "0x9c60a2a58e07018954c9f1dc3650fdee96968933b192ed12711a997da7d3a96c";
		service.owner_id = "5EFb5C9AjhGnejq1f8k7bPGgAdQV4iM84EjwdopHhJidftfi";

		return service;
	}

	function createMockOrder(status: OrderStatus): Orders {
		const first_price: Price = new Price();
		first_price.component = "testing_price";
		first_price.value = 15;
		const second_price: Price = new Price();
		second_price.component = "qc_price";
		second_price.value = 5;

		const order: Orders = new Orders();
		order.id = "0xff667c9c1d315f8871d7739236905404806e201930d555bcf91f786a4f34d253";
		order.service_id = "0x713e03730daf4715aaf7b018d54a9855d08860ce12a3cc57b5bb7dc1bc1a9309";
		order.customer_id = "5ESGhRuAhECXu96Pz9L8pwEEd1AeVhStXX67TWE1zHRuvJNU";
		order.customer_box_public_key = "0xe2829ff8b96c52401dc9f89c5ce77df95868b5c9da2b7f70f04be1e9f8c39a74";
		order.seller_id = "5ESGhRuAhECXu96Pz9L8pwEEd1AeVhStXX67TWE1zHRuvJNU";
		order.dna_sample_tracking_id = "29C78CYDIUT3H75Z3229C";
		order.currency = Currency.Dai;
		order.prices = [ first_price ];
		order.additional_prices = [ second_price ];
		order.status = status;
		order.created_at = BigInt("1632212142000");
		order.updated_at = BigInt("1632212142000");

		return order;
	}

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				CommonModule,
				ElasticsearchModule.registerAsync({
					useFactory: async () => ({
						node: process.env.ELASTICSEARCH_NODE,
					}),
				}),
				CqrsModule,
			],
			controllers: [SubstrateController],
			providers: [
				ElasticsearchService,
				ElasticSearchServiceProvider,
				SubstrateService, 
				substrateServiceProvider, 
				CommandBus, 
				CommandBusProvider,
				...LabCommandHandlers,
				...ServiceCommandHandlers,
				...OrderCommandHandlers,
				SetLastSubstrateBlockHandler,
				DeleteAllIndexesHandler,
				GetLastSubstrateBlockHandler,
			]
		}).compile();

		substrateController = module.get<SubstrateController>(SubstrateController);
		substrateService = module.get<SubstrateService>(SubstrateService);
		commandBus = module.get<CommandBus>(CommandBus);
		labDeregisteredHandler = module.get<LabDeregisteredHandler>(LabDeregisteredHandler);
		labRegisteredHandler = module.get<LabRegisteredHandler>(LabRegisteredHandler);
		labUpdatedHandler = module.get<LabUpdatedHandler>(LabUpdatedHandler);
		serviceCreatedHandler = module.get<ServiceCreatedHandler>(ServiceCreatedHandler);
		serviceDeletedHandler = module.get<ServiceDeletedHandler>(ServiceDeletedHandler);
		serviceUpdatedHandler = module.get<ServiceUpdatedHandler>(ServiceUpdatedHandler);
		orderCancelledHandler = module.get<OrderCancelledHandler>(OrderCancelledHandler);
		orderCreatedHandler = module.get<OrderCreatedHandler>(OrderCreatedHandler);
		orderFailedHandler = module.get<OrderFailedHandler>(OrderFailedHandler);
		orderFulfilledHandler = module.get<OrderFulfilledHandler>(OrderFulfilledHandler);
		orderPaidHandler = module.get<OrderPaidHandler>(OrderPaidHandler);
		orderRefundedHandler = module.get<OrderRefundedHandler>(OrderRefundedHandler);
		deleteAllIndexesHandler = module.get<DeleteAllIndexesHandler>(DeleteAllIndexesHandler);
		setLastSubstrateBlockHandler = module.get<SetLastSubstrateBlockHandler>(SetLastSubstrateBlockHandler);
		getLastSubstrateBlockHandler = module.get<GetLastSubstrateBlockHandler>(GetLastSubstrateBlockHandler);
	});

	describe("Substrate", () => {
		it("Substrate Controller must defined", () => {
			expect(substrateController).toBeDefined();
			expect(substrateController.onApplicationBootstrap).toBeDefined();
		});

		it("Substrate Service must defined", () => {
			expect(substrateService).toBeDefined();
		});

		it("CommandBus must defined", () => {
			expect(commandBus).toBeDefined();
		});
	});

	describe("Substrate onApplicationBootstrap", () => {
		it("Substrate onApplicationBootstrap called and call another method in substrate service", async () => {
			await substrateController.onApplicationBootstrap();

			expect(substrateService.syncBlock).toBeCalled();
			expect(substrateService.listenToEvents).toBeCalled();
			expect(substrateService.listenToNewBlock).toBeCalled();
		});
	});

	describe("Lab Handler", () => {
		it("Lab Deregistered Handler", async () => {
			const lab = createMockLab({
				address: "Jakarta",
				box_public_key: "0xe2829ff8b96c52401dc9f89c5ce77df95868b5c9da2b7f70f04be1e423g563",
				city: "ID-JK",
				country: "ID",
				email: "email@labdnafavorit.com",
				latitude: null,
				longitude: null,
				name: "Laboratorium DNA Favourites",
				profile_image: null,
				region: "ID-JK",
				account_id: "5ESGhRuAhECXu96Pz9L8pwEEd1AeVhStXX67TWE1zTEA62U",
				certifications: [],
				services: []
			});
			
			const labDeregisteredHandlerSpy = jest.spyOn(labDeregisteredHandler, 'execute');
			const labDeregisteredCommand: LabDeregisteredCommand = new LabDeregisteredCommand(lab);
			await labDeregisteredHandler.execute(labDeregisteredCommand);
			expect(labDeregisteredHandlerSpy).toBeCalled();
			expect(labDeregisteredHandlerSpy).toBeCalledWith(labDeregisteredCommand);
		});

		
		it("Lab Registered Handler", async () => {
			const lab = createMockLab({
				address: "Jakarta",
				box_public_key: "0xe2829ff8b96c52401dc9f89c5ce77df95868b5c9da2b7f70f04be1e423g563",
				city: "ID-JK",
				country: "ID",
				email: "email@labdnafavorit.com",
				latitude: null,
				longitude: null,
				name: "Laboratorium DNA Favourites",
				profile_image: null,
				region: "ID-JK",
				account_id: "5ESGhRuAhECXu96Pz9L8pwEEd1AeVhStXX67TWE1zTEA62U",
				certifications: [],
				services: []
			});
			
			const labRegisteredHandlerSpy = jest.spyOn(labRegisteredHandler, 'execute');
			const labRegisteredCommand: LabDeregisteredCommand = new LabRegisteredCommand(lab);
			await labRegisteredHandler.execute(labRegisteredCommand);
			expect(labRegisteredHandlerSpy).toBeCalled();
			expect(labRegisteredHandlerSpy).toBeCalledWith(labRegisteredCommand);
		});

		it("Lab Updated Handler", async () => {
			const lab = createMockLab({
				address: "Jakarta",
				box_public_key: "0xe2829ff8b96c52401dc9f89c5ce77df95868b5c9da2b7f70f04be1e423g563",
				city: "ID-JK",
				country: "ID",
				email: "email@labdnafavorit.com",
				latitude: null,
				longitude: null,
				name: "Laboratorium DNA Favourites",
				profile_image: null,
				region: "ID-JK",
				account_id: "5ESGhRuAhECXu96Pz9L8pwEEd1AeVhStXX67TWE1zTEA62U",
				certifications: [],
				services: []
			});
			
			const labUpdateHandlerSpy = jest.spyOn(labUpdatedHandler, 'execute');
			const labUpdatedCommand: LabUpdatedCommand = new LabUpdatedCommand(lab);
			await labUpdatedHandler.execute(labUpdatedCommand);
			expect(labUpdateHandlerSpy).toBeCalled();
			expect(labUpdateHandlerSpy).toBeCalledWith(labUpdatedCommand);
		});

		it("Service Created Handler", async () => {
			const service: Services = createMockService();
			
			const serviceCreatedHandlerSpy = jest.spyOn(serviceCreatedHandler, 'execute');
			const serviceCreatedCommand: ServiceCreatedCommand = new ServiceCreatedCommand(service);
			await serviceCreatedHandler.execute(serviceCreatedCommand);
			expect(serviceCreatedHandlerSpy).toBeCalled();
			expect(serviceCreatedHandlerSpy).toBeCalledWith(serviceCreatedCommand);
		});

		it("Service Deleted Handler", async () => {
			const service: Services = createMockService();
			
			const serviceDeletedHandlerSpy = jest.spyOn(serviceDeletedHandler, 'execute');
			const serviceDeletedCommand: ServiceDeletedCommand = new ServiceDeletedCommand(service);
			await serviceDeletedHandler.execute(serviceDeletedCommand);
			expect(serviceDeletedHandlerSpy).toBeCalled();
			expect(serviceDeletedHandlerSpy).toBeCalledWith(serviceDeletedCommand);
		});

		it("Service Updated Handler", async () => {
			const service: Services = createMockService();
			
			const serviceUpdatedHandlerSpy = jest.spyOn(serviceUpdatedHandler, 'execute');
			const serviceUpdatedCommand: ServiceUpdatedCommand = new ServiceUpdatedCommand(service);
			await serviceUpdatedHandler.execute(serviceUpdatedCommand);
			expect(serviceUpdatedHandlerSpy).toBeCalled();
			expect(serviceUpdatedHandlerSpy).toBeCalledWith(serviceUpdatedCommand);
		});

		it("Order Cancelled Handler", async () => {
			const order: Orders = createMockOrder(OrderStatus.Cancelled);
			
			const orderCancelledHandlerSpy = jest.spyOn(orderCancelledHandler, 'execute');
			const orderCancelledCommand: OrderCancelledCommand = new OrderCancelledCommand(order);
			await orderCancelledHandler.execute(orderCancelledCommand);
			expect(orderCancelledHandlerSpy).toBeCalled();
			expect(orderCancelledHandlerSpy).toBeCalledWith(orderCancelledCommand);
		});

		it("Order Created Handler", async () => {
			const order: Orders = createMockOrder(OrderStatus.Unpaid);
			
			const orderCreatedHandlerSpy = jest.spyOn(orderCreatedHandler, 'execute');
			const orderCreatedCommand: OrderCreatedCommand = new OrderCreatedCommand(order);
			await orderCreatedHandler.execute(orderCreatedCommand);
			expect(orderCreatedHandlerSpy).toBeCalled();
			expect(orderCreatedHandlerSpy).toBeCalledWith(orderCreatedCommand);
		});

		it("Order Failed Handler", async () => {
			const order: Orders = createMockOrder(OrderStatus.Failed);
			
			const orderFailedHandlerSpy = jest.spyOn(orderFailedHandler, 'execute');
			const orderFailedCommand: OrderFailedCommand = new OrderFailedCommand(order);
			await orderFailedHandler.execute(orderFailedCommand);
			expect(orderFailedHandlerSpy).toBeCalled();
			expect(orderFailedHandlerSpy).toBeCalledWith(orderFailedCommand);
		});

		it("Order Fulfilled Handler", async () => {
			const order: Orders = createMockOrder(OrderStatus.Failed);
			
			const orderFulfilledHandlerSpy = jest.spyOn(orderFulfilledHandler, 'execute');
			const orderFulfilledCommand: OrderFulfilledCommand = new OrderFulfilledCommand(order);
			await orderFulfilledHandler.execute(orderFulfilledCommand);
			expect(orderFulfilledHandlerSpy).toBeCalled();
			expect(orderFulfilledHandlerSpy).toBeCalledWith(orderFulfilledCommand);
		});

		it("Order Paid Handler", async () => {
			const order: Orders = createMockOrder(OrderStatus.Paid);
			
			const orderPaidHandlerSpy = jest.spyOn(orderPaidHandler, 'execute');
			const orderPaidCommand: OrderPaidCommand = new OrderPaidCommand(order);
			await orderPaidHandler.execute(orderPaidCommand);
			expect(orderPaidHandlerSpy).toBeCalled();
			expect(orderPaidHandlerSpy).toBeCalledWith(orderPaidCommand);
		});

		it("Order Refunded Handler", async () => {
			const order: Orders = createMockOrder(OrderStatus.Refunded);
			
			const orderRefundedHandlerSpy = jest.spyOn(orderRefundedHandler, 'execute');
			const orderRefundedCommand: OrderRefundedCommand = new OrderRefundedCommand(order);
			await orderRefundedHandler.execute(orderRefundedCommand);
			expect(orderRefundedHandlerSpy).toBeCalled();
			expect(orderRefundedHandlerSpy).toBeCalledWith(orderRefundedCommand);
		});

		it("Delete All Indexes Handler", async () => {
			const deleteAllIndexesHandlerSpy = jest.spyOn(deleteAllIndexesHandler, 'execute');
			await deleteAllIndexesHandler.execute();
			expect(deleteAllIndexesHandlerSpy).toBeCalled();
		});

		it("Set Last Substrate Block Handler", async () => {
			const mockBlockNumber: number = 12345;
			const setLastSubstrateBlockHandlerSpy = jest.spyOn(setLastSubstrateBlockHandler, 'execute');
			const setLastSubstrateBlockCommand: SetLastSubstrateBlockCommand = new SetLastSubstrateBlockCommand(mockBlockNumber);
			await setLastSubstrateBlockHandler.execute(setLastSubstrateBlockCommand);
			expect(setLastSubstrateBlockHandlerSpy).toBeCalled();
			expect(setLastSubstrateBlockHandlerSpy).toBeCalledWith(setLastSubstrateBlockCommand);
		});

		it("Get Last Substrate Block Handler", async () => {
			const getLastSubstrateBlockHandlerSpy = jest.spyOn(getLastSubstrateBlockHandler, 'execute');
			await getLastSubstrateBlockHandler.execute();
			expect(getLastSubstrateBlockHandlerSpy).toBeCalled();
			expect(getLastSubstrateBlockHandlerSpy).toHaveReturned();
		});
	});
});