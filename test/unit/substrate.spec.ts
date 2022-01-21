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
	ElasticsearchService
} from "@nestjs/elasticsearch";
import { ServiceCommandHandlers } from "../../src/substrate/events/services";
import { LabCommandHandlers } from "../../src/substrate/events/labs";
import { OrderCommandHandlers } from "../../src/substrate/events/orders";
import { CommandBusProvider, ElasticSearchServiceProvider, substrateServiceProvider } from "./mock";

describe("Substrate Indexer", () => {
	let substrateController: SubstrateController;
	let substrateService: SubstrateService;
	let commandBus: CommandBus;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				CommonModule,
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