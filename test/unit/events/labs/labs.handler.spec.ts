import {
  Test,
  TestingModule
} from "@nestjs/testing";
import {
  LabCommandHandlers,
  LabDeregisteredCommand,
  LabRegisteredCommand,
  LabUpdatedCommand,
	LabUpdateVerificationStatusCommand
} from "../../../../src/substrate/events/labs";
import { 
	LabDeregisteredHandler 
} from "../../../../src/substrate/events/labs/commands/lab-deregistered/lab-deregistered.handler";
import { 
	LabRegisteredHandler 
} from "../../../../src/substrate/events/labs/commands/lab-registered/lab-registered.handler";
import { 
	LabUpdatedHandler 
} from "../../../../src/substrate/events/labs/commands/lab-updated/lab-updated.handler";
import { 
	LabUpdateVerificationStatusHandler
} from "../../../../src/substrate/events/labs/commands/lab-update-verification-status/lab-update-verification-status.handler";
import {
  ElasticsearchService
} from "@nestjs/elasticsearch";
import { BlockMetaData } from "../../../../src/substrate/models/blockMetaData";
import { ElasticSearchServiceProvider } from "../../mock";
import { LabVerificationStatus } from "../../../../src/substrate/events/labs/models/lab-verification-status";

let labDeregisteredHandler: LabDeregisteredHandler;
let labRegisteredHandler: LabRegisteredHandler;
let labUpdatedHandler: LabUpdatedHandler;
let labUpdateVerificationStatusHandler: LabUpdateVerificationStatusHandler;

let elasticsearchService: ElasticsearchService;
describe("Labs Substrate Event Handler", () => {
  
	const createMockLab = () => {
		const labInfo = {
			boxPublicKey: 'string', 
			name: 'string', 
			email: 'string', 
			phoneNumber: 'string', 
			website: 'string', 
			country: 'XX', 
			region: 'XX', 
			city: 'XX', 
			address: 'string', 
			latitude: 'string', 
			longitude: 'string', 
			profileImage: 'string'
		};

		return {
      toHuman: jest.fn(
        () => ({
          accountId: 'string', 
          services: [1], 
          certifications: [1], 
          verificationStatus: [1], 
          info: labInfo
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
				...LabCommandHandlers,
      ]
    }).compile();
    
		labDeregisteredHandler  						= modules.get<LabDeregisteredHandler>(LabDeregisteredHandler);
		labRegisteredHandler    						= modules.get<LabRegisteredHandler>(LabRegisteredHandler);
		labUpdatedHandler       						= modules.get<LabUpdatedHandler>(LabUpdatedHandler);
		labUpdateVerificationStatusHandler 	= modules.get<LabUpdateVerificationStatusHandler>(LabUpdateVerificationStatusHandler);

		elasticsearchService 	= modules.get<ElasticsearchService>(ElasticsearchService);
		
		await modules.init();
  });
  
	describe("Lab Handler", () => {
		it("Lab Deregistered Handler", async () => {
			const lab = createMockLab();
			
			const labDeregisteredCommand: LabDeregisteredCommand = new LabDeregisteredCommand([lab], mockBlockNumber());
			await labDeregisteredHandler.execute(labDeregisteredCommand);
			expect(elasticsearchService.delete).toHaveBeenCalled();
		});
		
		it("Lab Deregistered Handler", async () => {
			const lab = createMockLab();
			
			const labDeregisteredCommand: LabDeregisteredCommand = new LabDeregisteredCommand([lab], mockBlockNumber());
			await labDeregisteredHandler.execute(labDeregisteredCommand);
			expect(elasticsearchService.delete).toHaveBeenCalled();
			expect(elasticsearchService.deleteByQuery).toHaveBeenCalled();
		});
		
		it("Lab Registered Handler", async () => {
			const lab = createMockLab();
			
			const labRegisteredCommand: LabDeregisteredCommand = new LabRegisteredCommand([lab], mockBlockNumber());
			await labRegisteredHandler.execute(labRegisteredCommand);
			expect(elasticsearchService.index).toHaveBeenCalled();
		});

		it("Lab Updated Handler", async () => {
			const lab = createMockLab();
			
			const labUpdatedCommand: LabUpdatedCommand = new LabUpdatedCommand([lab], mockBlockNumber());
			await labUpdatedHandler.execute(labUpdatedCommand);
			expect(elasticsearchService.update).toHaveBeenCalled();
			expect(elasticsearchService.updateByQuery).toHaveBeenCalled();
		});

		it("Lab Updated Verification Status Handler", async () => {
			const lab = createMockLab();
			
			const labUpdatedVerificationStatusCommand: LabUpdateVerificationStatusCommand = new LabUpdateVerificationStatusCommand([lab], mockBlockNumber());
			await labUpdateVerificationStatusHandler.execute(labUpdatedVerificationStatusCommand);
			expect(elasticsearchService.update).toHaveBeenCalled();
		});
	});
});