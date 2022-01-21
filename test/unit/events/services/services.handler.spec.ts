import { 
	ElasticsearchService 
} from "@nestjs/elasticsearch";
import { Test, TestingModule } from "@nestjs/testing";
import {
  ServiceCommandHandlers,
  ServiceCreatedCommand,
  ServiceDeletedCommand,
  ServiceUpdatedCommand
} from "../../../../src/substrate/events/services";
import { BlockMetaData } from "../../../../src/substrate/models/blockMetaData";
import { ServiceFlow } from "../../../../src/substrate/models/service-flow";
import { ServiceCreatedHandler } from "../../../../src/substrate/events/services/commands/service-created/service-created.handler";
import { ServiceDeletedHandler } from "../../../../src/substrate/events/services/commands/service-deleted/service-deleted.handler";
import { ServiceUpdatedHandler } from "../../../../src/substrate/events/services/commands/service-updated/service-updated.handler";
import { ElasticSearchServiceProvider } from "../../mock";

let serviceCreatedHandler: ServiceCreatedHandler;
let serviceDeletedHandler: ServiceDeletedHandler;
let serviceUpdatedHandler: ServiceUpdatedHandler;

let elasticsearchService: ElasticsearchService;

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
      providers: [
				ElasticsearchService,
				ElasticSearchServiceProvider,
				...ServiceCommandHandlers,
      ]
    }).compile();
    
		serviceCreatedHandler = modules.get<ServiceCreatedHandler>(ServiceCreatedHandler);
		serviceDeletedHandler = modules.get<ServiceDeletedHandler>(ServiceDeletedHandler);
		serviceUpdatedHandler = modules.get<ServiceUpdatedHandler>(ServiceUpdatedHandler);

		elasticsearchService 	= modules.get<ElasticsearchService>(ElasticsearchService);
		
		await modules.init();
  });
  
	describe("Service Handler", () => {
		it("Service Created Handler", async () => {
			const service = createMockService();
			
			const serviceCreatedCommand: ServiceCreatedCommand = new ServiceCreatedCommand([service], mockBlockNumber());
			await serviceCreatedHandler.execute(serviceCreatedCommand);
			expect(elasticsearchService.search).toHaveBeenCalled();
			expect(elasticsearchService.index).toHaveBeenCalled();
			expect(elasticsearchService.update).toHaveBeenCalled();
		});

		it("Service Deleted Handler", async () => {
			const service = createMockService();
			
			const serviceDeletedCommand: ServiceDeletedCommand = new ServiceDeletedCommand([service], mockBlockNumber());
			await serviceDeletedHandler.execute(serviceDeletedCommand);
			expect(elasticsearchService.search).toHaveBeenCalled();
			expect(elasticsearchService.delete).toHaveBeenCalled();
			expect(elasticsearchService.update).toHaveBeenCalled();
		});

		it("Service Updated Handler", async () => {
			const service = createMockService();
			
			const serviceUpdatedCommand: ServiceUpdatedCommand = new ServiceUpdatedCommand([service], mockBlockNumber());
			await serviceUpdatedHandler.execute(serviceUpdatedCommand);
			expect(elasticsearchService.search).toHaveBeenCalled();
			expect(elasticsearchService.updateByQuery).toHaveBeenCalled();
			expect(elasticsearchService.update).toHaveBeenCalled();
		});
	});
});