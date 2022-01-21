import {
	CommandBus,
	CqrsModule
} from "@nestjs/cqrs";
import {
	ElasticsearchService
} from "@nestjs/elasticsearch";
import {
	Test,
	TestingModule
} from "@nestjs/testing";
import { BlockMetaData } from "../../../../src/substrate/models/blockMetaData";
import {
	SubstrateController,
	SubstrateService
} from "../../../../src/substrate/substrate.handler";
import { 
	CommonModule 
} from "../../../../src/common/common.module";
import { 
	DataStakedHandler 
} from "../../../../src/substrate/events/genetic-testing/commands/data-staked/data-staked.handler";
import {
	DataStakedCommand,
	GeneticTestingCommandHandlers
} from "../../../../src/substrate/events/genetic-testing";
import { 
	CommandBusProvider, 
	ElasticSearchServiceProvider, 
	substrateServiceProvider 
} from "../../mock";

let dataStakedHandler: DataStakedHandler;

let commandBus: CommandBus;

describe("Genetic Testing Substrate Event Handler", () => {
  
	const createMockDataStaked = () => {
    return [
      "string",
      "string",
      "string"
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
    
		dataStakedHandler  		= modules.get<DataStakedHandler>(DataStakedHandler);

		commandBus						= modules.get<CommandBus>(CommandBus);
		
		await modules.init();
  });

  describe("Data Staked Handler defined", () => {
		it("Data Staked handler", () => {
			expect(dataStakedHandler).toBeDefined();
		});
	});
  
	describe("Data Staked Event Command", () => {
		it("Data Staked Command", async () => {
			const staked = createMockDataStaked();
			
			const dataStakedHandlerSpy = jest.spyOn(dataStakedHandler, 'execute');
			const dataStakedCommand: DataStakedCommand = new DataStakedCommand(staked, mockBlockNumber());
			await commandBus.execute(dataStakedCommand);
			expect(dataStakedHandlerSpy).toBeCalled();
			expect(dataStakedHandlerSpy).toBeCalledWith(dataStakedCommand);
		});
	});
});