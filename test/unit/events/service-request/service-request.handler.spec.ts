import {
	ElasticsearchService
} from "@nestjs/elasticsearch";
import {
	Test,
	TestingModule
} from "@nestjs/testing";
import { ClaimedServiceRequestHandler } from "../../../../src/substrate/events/service-request//commands/claimed-service-request/claimed-service-request.handler";
import { CreateServiceRequestHandler } from "../../../../src/substrate/events/service-request//commands/create-service-request/create-service-request.handler";
import { FinalizedServiceRequestHandler } from "../../../../src/substrate/events/service-request//commands/finalized-service-request/finalized-service-request.handler";
import { ProcessedServiceRequestHandler } from "../../../../src/substrate/events/service-request//commands/processed-service-request/processed-service-request.handler";
import { UnstakedServiceRequestHandler } from "../../../../src/substrate/events/service-request//commands/unstaked-service-request/unstaked-service-request.handler";
import { UnstakedWaitingServiceRequestHandler } from "../../../../src/substrate/events/service-request//commands/unstakedwaiting-service-request/unstakedwaiting-service-request.handler";
import { 
  ClaimedServiceRequestCommand, 
  CreateServiceRequestCommand, 
  FinalizedServiceRequestCommand, 
  ProcessedServiceRequestCommand, 
  RequestServiceCommandHandlers, 
  UnstakedServiceRequestCommand, 
  UnstakedWaitingServiceRequestCommand 
} from "../../../../src/substrate/events/service-request/";
import { RequestStatus } from "../../../../src/substrate/events/service-request//models/requestStatus";
import { BlockMetaData } from "../../../../src/substrate/models/blockMetaData";
import {  ElasticSearchServiceProvider } from "../../mock";

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
            hash_: "string",
            requesterAddress: "string",
            labAddress: "string",
            country: "XX",
            region: "XX",
            city: "XX",
            serviceCategory: "Test",
            stakingAmount: "1000000000000",
            status: requestStatus,
            createdAt: "1",
            updatedAt: "1",
            unstakedAt: "1"
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

  describe("Service Request Handler", () => {
		it("Claimed service request handler defined", () => {
			expect(claimedServiceRequestHandler).toBeDefined();
		});
		
		it("Created service request handler defined", () => {
			expect(createServiceRequestHandler).toBeDefined();
		});
		
		it("Finalized service request handler defined", () => {
			expect(finalizedServiceRequestHandler).toBeDefined();
		});
		
		it("Processed service request handler defined", () => {
			expect(processedServiceRequestHandler).toBeDefined();
		});
		
		it("Unstaked service request handler defined", () => {
			expect(unstakedServiceRequestHandler).toBeDefined();
		});
		
		it("Unstaked waiting service request handler defined", () => {
			expect(unstakedWaitingServiceRequestHandler).toBeDefined();
		});
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