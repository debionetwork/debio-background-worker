import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { ElasticsearchModule, ElasticsearchService } from "@nestjs/elasticsearch";
import { 
  ServiceCommandHandlers, 
  ServiceCreatedCommand, 
  ServiceDeletedCommand, 
  ServiceUpdatedCommand 
} from ".";
import { SubstrateController, SubstrateService } from "../substrate.handler";
import { ServiceCreatedHandler } from "./commands/service-created/service-created.handler";
import { ServiceDeletedHandler } from "./commands/service-deleted/service-deleted.handler";
import { ServiceUpdatedHandler } from "./commands/service-updated/service-updated.handler";
import { Price } from "./models/price";
import { Service } from "./models/service";
import { PriceByCurrency } from "./models/price-by-currency";
import { ServiceInfo } from "./models/service-info";
import { BlockMetaData } from "../models/blockMetaData";
import { Test, TestingModule } from "@nestjs/testing";
import { CommonModule } from "../../common/common.module";
import { ServiceFlow } from "../models/service-flow";

describe("Services Substrate Event Handler", () => {
	let serviceCreatedHandler: ServiceCreatedHandler;
	let serviceDeletedHandler: ServiceDeletedHandler;
	let serviceUpdatedHandler: ServiceUpdatedHandler;

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
  });
  
	describe("Service Handler", () => {
		it("Service Created Handler", async () => {
			const service = createMockService();
			
			const serviceCreatedHandlerSpy = jest.spyOn(serviceCreatedHandler, 'execute');
			const serviceCreatedCommand: ServiceCreatedCommand = new ServiceCreatedCommand([service], mockBlockNumber());
			await serviceCreatedHandler.execute(serviceCreatedCommand);
			expect(serviceCreatedHandlerSpy).toBeCalled();
			expect(serviceCreatedHandlerSpy).toBeCalledWith(serviceCreatedCommand);
		});

		it("Service Deleted Handler", async () => {
			const service = createMockService();
			
			const serviceDeletedHandlerSpy = jest.spyOn(serviceDeletedHandler, 'execute');
			const serviceDeletedCommand: ServiceDeletedCommand = new ServiceDeletedCommand([service], mockBlockNumber());
			await serviceDeletedHandler.execute(serviceDeletedCommand);
			expect(serviceDeletedHandlerSpy).toBeCalled();
			expect(serviceDeletedHandlerSpy).toBeCalledWith(serviceDeletedCommand);
		});

		it("Service Updated Handler", async () => {
			const service = createMockService();
			
			const serviceUpdatedHandlerSpy = jest.spyOn(serviceUpdatedHandler, 'execute');
			const serviceUpdatedCommand: ServiceUpdatedCommand = new ServiceUpdatedCommand([service], mockBlockNumber());
			await serviceUpdatedHandler.execute(serviceUpdatedCommand);
			expect(serviceUpdatedHandlerSpy).toBeCalled();
			expect(serviceUpdatedHandlerSpy).toBeCalledWith(serviceUpdatedCommand);
		});
	});
});