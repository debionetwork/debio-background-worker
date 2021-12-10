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
import {
	SubstrateController,
	SubstrateService
} from "../../../src/substrate/substrate.handler";
import { CommonModule } from "../../../src/common/common.module";
import { ClaimedServiceRequestHandler } from "../../../src/substrate/service-request/commands/claimed-service-request/claimed-service-request.handler";
import { CreateServiceRequestHandler } from "../../../src/substrate/service-request/commands/create-service-request/create-service-request.handler";
import { FinalizedServiceRequestHandler } from "../../../src/substrate/service-request/commands/finalized-service-request/finalized-service-request.handler";
import { ProcessedServiceRequestHandler } from "../../../src/substrate/service-request/commands/processed-service-request/processed-service-request.handler";
import { UnstakedServiceRequestHandler } from "../../../src/substrate/service-request/commands/unstaked-service-request/unstaked-service-request.handler";
import { UnstakedWaitingServiceRequestHandler } from "../../../src/substrate/service-request/commands/unstakedwaiting-service-request/unstakedwaiting-service-request.handler";
import { ClaimedServiceRequestCommand, CreateServiceRequestCommand, FinalizedServiceRequestCommand, ProcessedServiceRequestCommand, RequestServiceCommandHandlers, UnstakedServiceRequestCommand, UnstakedWaitingServiceRequestCommand } from "../../../src/substrate/service-request";
import { RequestStatus } from "../../../src/substrate/service-request/models/requestStatus";
import { BlockMetaData } from "../../../src/substrate/models/blockMetaData";
import { CommandBusProvider, ElasticSearchServiceProvider, substrateServiceProvider } from "../mock";

let claimedServiceRequestHandler: ClaimedServiceRequestHandler;
let createServiceRequestHandler: CreateServiceRequestHandler;
let finalizedServiceRequestHandler: FinalizedServiceRequestHandler;
let processedServiceRequestHandler: ProcessedServiceRequestHandler;
let unstakedServiceRequestHandler: UnstakedServiceRequestHandler;
let unstakedWaitingServiceRequestHandler: UnstakedWaitingServiceRequestHandler;

let commandBus: CommandBus;

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
				...RequestServiceCommandHandlers,
      ]
    }).compile();

    claimedServiceRequestHandler          = modules.get<ClaimedServiceRequestHandler>(ClaimedServiceRequestHandler);
    createServiceRequestHandler           = modules.get<CreateServiceRequestHandler>(CreateServiceRequestHandler);
    finalizedServiceRequestHandler        = modules.get<FinalizedServiceRequestHandler>(FinalizedServiceRequestHandler);
    processedServiceRequestHandler        = modules.get<ProcessedServiceRequestHandler>(ProcessedServiceRequestHandler);
    unstakedServiceRequestHandler         = modules.get<UnstakedServiceRequestHandler>(UnstakedServiceRequestHandler);
    unstakedWaitingServiceRequestHandler  = modules.get<UnstakedWaitingServiceRequestHandler>(UnstakedWaitingServiceRequestHandler);

		commandBus 						= modules.get<CommandBus>(CommandBus);
		
		await modules.init();
  });
  
	describe("Service Request Event Command", () => {
		it("Claimed Service Request Command", async () => {
			const claimRequest = createMockClaimRequest();
			
			const claimedServiceRequestHandlerSpy = jest.spyOn(claimedServiceRequestHandler, 'execute');
			const claimedServiceRequestCommand: ClaimedServiceRequestCommand = new ClaimedServiceRequestCommand(claimRequest, mockBlockNumber());
			await commandBus.execute(claimedServiceRequestCommand);
			expect(claimedServiceRequestHandlerSpy).toBeCalled();
			expect(claimedServiceRequestHandlerSpy).toBeCalledWith(claimedServiceRequestCommand);
		});

		it("Create Service Request Command", async () => {
			const requestData = createMockRequest(RequestStatus.Open);

			const createServiceRequestHandlerSpy = jest.spyOn(createServiceRequestHandler, 'execute');
			const createServiceRequestCommand: CreateServiceRequestCommand = new CreateServiceRequestCommand(requestData, mockBlockNumber());
			await commandBus.execute(createServiceRequestCommand);
			expect(createServiceRequestHandlerSpy).toBeCalled();
			expect(createServiceRequestHandlerSpy).toBeCalledWith(createServiceRequestCommand);
		});

		it("Finalized Service Request Command", async () => {
			const serviceInvoice = createMockServiceInvoice();

			const finalizedServiceRequestHandlerSpy = jest.spyOn(finalizedServiceRequestHandler, 'execute');
			const finalizedServiceRequestCommand: FinalizedServiceRequestCommand = new FinalizedServiceRequestCommand(serviceInvoice, mockBlockNumber());
			await commandBus.execute(finalizedServiceRequestCommand);
			expect(finalizedServiceRequestHandlerSpy).toBeCalled();
			expect(finalizedServiceRequestHandlerSpy).toBeCalledWith(finalizedServiceRequestCommand);
		});
    
		it("Processed Service Request Command", async () => {
			const serviceInvoice = createMockServiceInvoice();

			const processedServiceRequestHandlerSpy = jest.spyOn(processedServiceRequestHandler, 'execute');
			const processedServiceRequestCommand: ProcessedServiceRequestCommand = new ProcessedServiceRequestCommand(serviceInvoice, mockBlockNumber());
			await commandBus.execute(processedServiceRequestCommand);
			expect(processedServiceRequestHandlerSpy).toBeCalled();
			expect(processedServiceRequestHandlerSpy).toBeCalledWith(processedServiceRequestCommand);
		});
    
		it("Unstaked Service Request Command", async () => {
			const requestData = createMockRequest(RequestStatus.Unstaked);

			const unstakedServiceRequestHandlerSpy = jest.spyOn(unstakedServiceRequestHandler, 'execute');
			const unstakedServiceRequestCommand: UnstakedServiceRequestCommand = new UnstakedServiceRequestCommand(requestData, mockBlockNumber());
			await commandBus.execute(unstakedServiceRequestCommand);
			expect(unstakedServiceRequestHandlerSpy).toBeCalled();
			expect(unstakedServiceRequestHandlerSpy).toBeCalledWith(unstakedServiceRequestCommand);
		});
    
		it("Unstaked Waiting Service Request Command", async () => {
			const requestData = createMockRequest(RequestStatus.WaitingForUnstaked);

			const unstakedWaitingServiceRequestHandlerSpy = jest.spyOn(unstakedWaitingServiceRequestHandler, 'execute');
			const unstakedWaitingServiceRequestCommand: UnstakedWaitingServiceRequestCommand = new UnstakedWaitingServiceRequestCommand(requestData, mockBlockNumber());
			await commandBus.execute(unstakedWaitingServiceRequestCommand);
			expect(unstakedWaitingServiceRequestHandlerSpy).toBeCalled();
			expect(unstakedWaitingServiceRequestHandlerSpy).toBeCalledWith(unstakedWaitingServiceRequestCommand);
		});
	});
});