import {
	ElasticsearchService
} from "@nestjs/elasticsearch";
import {
	Test,
	TestingModule
} from "@nestjs/testing";
import { BlockMetaData } from "../../../src/substrate/models/blockMetaData";
import { DataStakedHandler } from "../../../src/substrate/genetic-testing/commands/data-staked/data-staked.handler";
import {
	DataStakedCommand,
	GeneticTestingCommandHandlers
} from "../../../src/substrate/genetic-testing";
import { ElasticSearchServiceProvider } from "../mock";

let dataStakedHandler: DataStakedHandler;

let elasticsearchService: ElasticsearchService;

describe("Genetic Testing Substrate Event Handler", () => {
  
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
      providers: [
				ElasticsearchService,
				ElasticSearchServiceProvider,
        ...GeneticTestingCommandHandlers
      ]
    }).compile();
    
		dataStakedHandler  		= modules.get<DataStakedHandler>(DataStakedHandler);

		elasticsearchService 	= modules.get<ElasticsearchService>(ElasticsearchService);
		
		await modules.init();
  });
  
	describe("Data Staked Event", () => {
		it("Data Staked Handler", async () => {
			const staked = createMockDataStaked();
			
			const dataStakedCommand: DataStakedCommand = new DataStakedCommand(staked, mockBlockNumber());

			await dataStakedHandler.execute(dataStakedCommand);
			expect(elasticsearchService.update).toHaveBeenCalled();
			expect(elasticsearchService.index).toHaveBeenCalled();
		});
	});
});