import {
	CommandBus,
	CqrsModule
} from "@nestjs/cqrs";
import {
	ElasticsearchModule,
	ElasticsearchService
} from "@nestjs/elasticsearch";
import {
	Test,
	TestingModule
} from "@nestjs/testing";
import { BlockMetaData } from "../../src/substrate/models/blockMetaData";
import {
	SubstrateController,
	SubstrateService
} from "../../src/substrate/substrate.handler";
import { CommonModule } from "../../src/common/common.module";
import { DataStakedHandler } from "../../src/substrate/genetic-testing/commands/data-staked/data-staked.handler";
import {
	DataStakedCommand,
	GeneticTestingCommandHandlers
} from "../../src/substrate/genetic-testing";

describe("Genetic Testing Substrate Event Handler", () => {
	let dataStakedHandler: DataStakedHandler;

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
  
	const createMockDataStaked = () => {
    return [
      "5ESGhRuAhECXu96Pz9L8pwEEd1AeVhStXX67TWE1zTEA62U",
      "0xe2829ff8b96c52401dc9f89c5ce77df95868b5c9da2b7f70f04be1e423g563",
      "0xe2829ff8b96c52401dc9f89c5ce77df95868b5c9da2b7f70f04be1e423g563"
    ]
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
        ...GeneticTestingCommandHandlers
      ]
    }).compile();
    
		dataStakedHandler  = modules.get<DataStakedHandler>(DataStakedHandler);
  });
  
	describe("Data Staked Event", () => {
		it("Data Staked Handler", async () => {
			const staked = createMockDataStaked();
			
			const dataStakedHandlerSpy = jest.spyOn(dataStakedHandler, 'execute');
			const dataStakedCommand: DataStakedCommand = new DataStakedCommand(staked, mockBlockNumber());
			await dataStakedHandler.execute(dataStakedCommand);
			expect(dataStakedHandlerSpy).toBeCalled();
		});
	});
});