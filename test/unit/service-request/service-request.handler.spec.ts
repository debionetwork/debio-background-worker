import {
	ElasticsearchService
} from "@nestjs/elasticsearch";
import {
	Test,
	TestingModule
} from "@nestjs/testing";
import { ClaimedServiceRequestHandler } from "../../../src/substrate/service-request/commands/claimed-service-request/claimed-service-request.handler";
import { CreateServiceRequestHandler } from "../../../src/substrate/service-request/commands/create-service-request/create-service-request.handler";
import { FinalizedServiceRequestHandler } from "../../../src/substrate/service-request/commands/finalized-service-request/finalized-service-request.handler";
import { ProcessedServiceRequestHandler } from "../../../src/substrate/service-request/commands/processed-service-request/processed-service-request.handler";
import { UnstakedServiceRequestHandler } from "../../../src/substrate/service-request/commands/unstaked-service-request/unstaked-service-request.handler";
import { UnstakedWaitingServiceRequestHandler } from "../../../src/substrate/service-request/commands/unstakedwaiting-service-request/unstakedwaiting-service-request.handler";
import { ClaimedServiceRequestCommand, CreateServiceRequestCommand, FinalizedServiceRequestCommand, ProcessedServiceRequestCommand, RequestServiceCommandHandlers, UnstakedServiceRequestCommand, UnstakedWaitingServiceRequestCommand } from "../../../src/substrate/service-request";
import { RequestStatus } from "../../../src/substrate/service-request/models/requestStatus";
import { BlockMetaData } from "../../../src/substrate/models/blockMetaData";
import {  ElasticSearchServiceProvider } from "../mock";

let claimedServiceRequestHandler: ClaimedServiceRequestHandler;
let createServiceRequestHandler: CreateServiceRequestHandler;
let finalizedServiceRequestHandler: FinalizedServiceRequestHandler;
let processedServiceRequestHandler: ProcessedServiceRequestHandler;
let unstakedServiceRequestHandler: UnstakedServiceRequestHandler;
let unstakedWaitingServiceRequestHandler: UnstakedWaitingServiceRequestHandler;

let elasticsearchService: ElasticsearchService;

describe("Service Request Substrate Event Handler", () => {

  const createMockRequest = (requestStatus: RequestStatus) => {
    return [
      {},
      {
        toHuman: jest.fn(
          () => ({
            hash_: "0xe2829ff8b96c52401dc9f89c5ce77df95868b5c9da2b7f70f04be1e423g563",
            requesterAddress: "0xe2829ff8b96c52401dc9f89c5ce77df95868b5c9da2b7f70f04be1e423g563",
            labAddress: "5ESGhRuAhECXu96Pz9L8pwEEd1AeVhStXX67TWE1zTEA62U",
            country: "ID",
            region: "JK",
            city: "Jakarta",
            serviceCategory: "Test",
            stakingAmount: "1000000000000",
            status: requestStatus,
            createdAt: "1632212142000",
            updatedAt: "1632212142000",
            unstakedAt: "1632212142000"
          })
        )
      }
    ]
  }

  const createMockServiceInvoice = () => {
    return [
      {},
      {
        toHuman: jest.fn(
          () => ({
            requestHash: "",
            orderId: "",
            serviceId: "",
            customerAddress: "",
            sellerAddress: "",
            dnaSampleTrackingId: "",
            testingPrice: "",
            qcPrice: "",
            payAmount: ""
          })
        )
      }
    ]
  }

  const createMockClaimRequest = (): Array<any> => {
    return [
      {},
      {
        toHuman: jest.fn(
          () => ({
            requestHash: "",
            labAddress: "",
            serviceId: "",
            testingPrice: "",
            qcPrice: ""
          })
        )
      }
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
				...RequestServiceCommandHandlers,
      ]
    }).compile();

    claimedServiceRequestHandler          = modules.get<ClaimedServiceRequestHandler>(ClaimedServiceRequestHandler);
    createServiceRequestHandler           = modules.get<CreateServiceRequestHandler>(CreateServiceRequestHandler);
    finalizedServiceRequestHandler        = modules.get<FinalizedServiceRequestHandler>(FinalizedServiceRequestHandler);
    processedServiceRequestHandler        = modules.get<ProcessedServiceRequestHandler>(ProcessedServiceRequestHandler);
    unstakedServiceRequestHandler         = modules.get<UnstakedServiceRequestHandler>(UnstakedServiceRequestHandler);
    unstakedWaitingServiceRequestHandler  = modules.get<UnstakedWaitingServiceRequestHandler>(UnstakedWaitingServiceRequestHandler);

		elasticsearchService 	= modules.get<ElasticsearchService>(ElasticsearchService);
		
		await modules.init();
  });
  
	describe("Service Request Event", () => {
		it("Claimed Service Request Handler", async () => {
			const claimRequest = createMockClaimRequest();
			
			const claimedServiceRequestCommand: ClaimedServiceRequestCommand = new ClaimedServiceRequestCommand(claimRequest, mockBlockNumber());
			await claimedServiceRequestHandler.execute(claimedServiceRequestCommand);
			expect(elasticsearchService.update).toHaveBeenCalled();
		});

		it("Create Service Request Handler", async () => {
			const requestData = createMockRequest(RequestStatus.Open);

			const createServiceRequestCommand: CreateServiceRequestCommand = new CreateServiceRequestCommand(requestData, mockBlockNumber());
			await createServiceRequestHandler.execute(createServiceRequestCommand);
			expect(elasticsearchService.index).toHaveBeenCalled();
		});

		it("Finalized Service Request Handler", async () => {
			const serviceInvoice = createMockServiceInvoice();

			const finalizedServiceRequestCommand: FinalizedServiceRequestCommand = new FinalizedServiceRequestCommand(serviceInvoice, mockBlockNumber());
			await finalizedServiceRequestHandler.execute(finalizedServiceRequestCommand);
			expect(elasticsearchService.update).toHaveBeenCalled();
		});
    
		it("Processed Service Request Handler", async () => {
			const serviceInvoice = createMockServiceInvoice();

			const processedServiceRequestCommand: ProcessedServiceRequestCommand = new ProcessedServiceRequestCommand(serviceInvoice, mockBlockNumber());
			await processedServiceRequestHandler.execute(processedServiceRequestCommand);
			expect(elasticsearchService.update).toHaveBeenCalled();
		});
    
		it("Unstaked Service Request Handler", async () => {
			const requestData = createMockRequest(RequestStatus.Unstaked);

			const unstakedServiceRequestCommand: UnstakedServiceRequestCommand = new UnstakedServiceRequestCommand(requestData, mockBlockNumber());
			await unstakedServiceRequestHandler.execute(unstakedServiceRequestCommand);
			expect(elasticsearchService.update).toHaveBeenCalled();
		});
    
		it("Unstaked Waiting Service Request Handler", async () => {
			const requestData = createMockRequest(RequestStatus.WaitingForUnstaked);

			const unstakedWaitingServiceRequestCommand: UnstakedWaitingServiceRequestCommand = new UnstakedWaitingServiceRequestCommand(requestData, mockBlockNumber());
			await unstakedWaitingServiceRequestHandler.execute(unstakedWaitingServiceRequestCommand);
			expect(elasticsearchService.update).toHaveBeenCalled();
		});
	});
});