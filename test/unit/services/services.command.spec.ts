import {
	CommandBus,
	CqrsModule
} from "@nestjs/cqrs";
import { 
	ElasticsearchModule, 
	ElasticsearchService 
} from "@nestjs/elasticsearch";
import { Test, TestingModule } from "@nestjs/testing";
import {
  ServiceCommandHandlers,
  ServiceCreatedCommand,
  ServiceDeletedCommand,
  ServiceUpdatedCommand
} from "../../../src/substrate/services";
import { CommonModule } from "../../../src/common/common.module";
import { BlockMetaData } from "../../../src/substrate/models/blockMetaData";
import { ServiceFlow } from "../../../src/substrate/models/service-flow";
import { ServiceCreatedHandler } from "../../../src/substrate/services/commands/service-created/service-created.handler";
import { ServiceDeletedHandler } from "../../../src/substrate/services/commands/service-deleted/service-deleted.handler";
import { ServiceUpdatedHandler } from "../../../src/substrate/services/commands/service-updated/service-updated.handler";
import {
	SubstrateController,
	SubstrateService
} from "../../../src/substrate/substrate.handler";
import { CommandBusProvider, ElasticSearchServiceProvider, substrateServiceProvider } from "../mock";

let serviceCreatedHandler: ServiceCreatedHandler;
let serviceDeletedHandler: ServiceDeletedHandler;
let serviceUpdatedHandler: ServiceUpdatedHandler;

let commandBus: CommandBus;

describe("Services Substrate Event Handler", () => {

	function createMockService() {
		const first_price = {
			component: "testing_price", 
			value: 15
		};
		const second_price = {
			component: "qc_price", 
			value: 5
		};

		const prices_by_currency = {
			currency: "Dai", 
			totalPrice: 20, 
			priceComponents: [ first_price ], 
			additionalPrices: [ second_price ]
		};

		const service_info = {
			name: "Exercise", 
			pricesByCurrency: [ prices_by_currency ],
			expected_duration: "",
			category: "Targeted Gene Panel Sequencing",
			description: "Find an effective workout based on your genetic code to maximize your workout gains.",
			dnaCollectionProcess: "",
			testResultSample: "",
			longDescription: null,
			image: "mdi-weight-lifter"
		};

		return {
      toHuman: jest.fn(
        () => ({
          info: service_info,
          id: "0x9c60a2a58e07018954c9f1dc3650fdee96968933b192ed12711a997da7d3a96c",
          ownerId: "5EFb5C9AjhGnejq1f8k7bPGgAdQV4iM84EjwdopHhJidftfi",
          serviceFlow: ServiceFlow.RequestTest
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
				...ServiceCommandHandlers,
      ]
    }).compile();
    
		serviceCreatedHandler = modules.get<ServiceCreatedHandler>(ServiceCreatedHandler);
		serviceDeletedHandler = modules.get<ServiceDeletedHandler>(ServiceDeletedHandler);
		serviceUpdatedHandler = modules.get<ServiceUpdatedHandler>(ServiceUpdatedHandler);

		commandBus 						= modules.get<CommandBus>(CommandBus);
		
		await modules.init();
  });

  describe("Service Handler", () => {
		it("Service created handler defined", () => {
			expect(serviceCreatedHandler).toBeDefined();
		});
		
		it("Service deleted handler defined", () => {
			expect(serviceDeletedHandler).toBeDefined();
		});
		
		it("Service updated handler defined", () => {
			expect(serviceUpdatedHandler).toBeDefined();
		});
	});

	describe("Service Command", () => {
		it("Service Created Command", async () => {
			const service = createMockService();
			
			const serviceCreatedHandlerSpy = jest.spyOn(serviceCreatedHandler, 'execute');
			const serviceCreatedCommand: ServiceCreatedCommand = new ServiceCreatedCommand([service], mockBlockNumber());
			await commandBus.execute(serviceCreatedCommand);
			expect(serviceCreatedHandlerSpy).toBeCalled();
			expect(serviceCreatedHandlerSpy).toBeCalledWith(serviceCreatedCommand);
		});

		it("Service Deleted Command", async () => {
			const service = createMockService();
			
			const serviceDeletedHandlerSpy = jest.spyOn(serviceDeletedHandler, 'execute');
			const serviceDeletedCommand: ServiceDeletedCommand = new ServiceDeletedCommand([service], mockBlockNumber());
			await commandBus.execute(serviceDeletedCommand);
			expect(serviceDeletedHandlerSpy).toBeCalled();
			expect(serviceDeletedHandlerSpy).toBeCalledWith(serviceDeletedCommand);
		});

		it("Service Updated Command", async () => {
			const service = createMockService();
			
			const serviceUpdatedHandlerSpy = jest.spyOn(serviceUpdatedHandler, 'execute');
			const serviceUpdatedCommand: ServiceUpdatedCommand = new ServiceUpdatedCommand([service], mockBlockNumber());
			await commandBus.execute(serviceUpdatedCommand);
			expect(serviceUpdatedHandlerSpy).toBeCalled();
			expect(serviceUpdatedHandlerSpy).toBeCalledWith(serviceUpdatedCommand);
		});
	});
});