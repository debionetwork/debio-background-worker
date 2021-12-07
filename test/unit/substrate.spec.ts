import {
	CommandBus,
	CqrsModule
} from "@nestjs/cqrs";
import {
	Test,
	TestingModule
} from "@nestjs/testing";
import { CommonModule } from "../../src/common/common.module";
import {
	SubstrateController,
	SubstrateService
} from "../../src/substrate/substrate.handler";
import {
	ElasticsearchModule,
	ElasticsearchService
} from "@nestjs/elasticsearch";
import { ServiceCommandHandlers } from "../../src/substrate/services";
import { LabCommandHandlers } from "../../src/substrate/labs";
import { OrderCommandHandlers } from "../../src/substrate/orders";

describe("Substrate Indexer", () => {
	let substrateController: SubstrateController;
	let substrateService: SubstrateService;
	let commandBus: CommandBus;

	const substrateServiceProvider = {
		provide: SubstrateService,
		useFactory: () => ({
			handleEvent: jest.fn(),
			listenToEvents: jest.fn(),
			listenToNewBlock: jest.fn(),
			syncBlock: jest.fn(),
			startListen: jest.fn()
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
			]
		}).compile();

		substrateController = module.get<SubstrateController>(SubstrateController);
		substrateService = module.get<SubstrateService>(SubstrateService);
		commandBus = module.get<CommandBus>(CommandBus);
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

			expect(substrateService.startListen).toBeCalled();
		});
	});
});