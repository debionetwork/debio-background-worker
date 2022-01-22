import {
	CommandBus,
	CqrsModule
} from "@nestjs/cqrs";
import {
	Test,
	TestingModule
} from "@nestjs/testing";
import {
	SubstrateController
} from "../../../../src/substrate/substrate.handler";
import { CommonModule } from "../../../../src/common/common.module";
import { ClaimedServiceRequestHandler } from "../../../../src/substrate/events/service-request/commands/claimed-service-request/claimed-service-request.handler";
import { CreateServiceRequestHandler } from "../../../../src/substrate/events/service-request/commands/create-service-request/create-service-request.handler";
import { FinalizedServiceRequestHandler } from "../../../../src/substrate/events/service-request/commands/finalized-service-request/finalized-service-request.handler";
import { ProcessedServiceRequestHandler } from "../../../../src/substrate/events/service-request/commands/processed-service-request/processed-service-request.handler";
import { UnstakedServiceRequestHandler } from "../../../../src/substrate/events/service-request/commands/unstaked-service-request/unstaked-service-request.handler";
import { UnstakedWaitingServiceRequestHandler } from "../../../../src/substrate/events/service-request/commands/unstakedwaiting-service-request/unstakedwaiting-service-request.handler";
import { 
	ClaimedServiceRequestCommand, 
	CreateServiceRequestCommand, 
	FinalizedServiceRequestCommand, 
	ProcessedServiceRequestCommand, 
	RequestServiceCommandHandlers, 
	UnstakedServiceRequestCommand, 
	UnstakedWaitingServiceRequestCommand 
} from "../../../../src/substrate/events/service-request";
import { RequestStatus } from "../../../../src/substrate/events/service-request/models/requestStatus";
import { BlockMetaData } from "../../../../src/substrate/models/blockMetaData";
import { 
	CommandBusProvider, 
	ElasticSearchServiceProvider, 
	substrateServiceProvider 
} from "../../mock";

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
			imports: [
				CommonModule,
				CqrsModule,
			],
			controllers: [
        SubstrateController
      ],
      providers: [
				ElasticSearchServiceProvider,
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
			
			const claimedServiceRequestHandlerSpy = jest.spyOn(claimedServiceRequestHandler, 'execute').mockImplementation();

			const claimedServiceRequestCommand: ClaimedServiceRequestCommand = new ClaimedServiceRequestCommand(claimRequest, mockBlockNumber());
			await commandBus.execute(claimedServiceRequestCommand);
			expect(claimedServiceRequestHandlerSpy).toBeCalled();
			expect(claimedServiceRequestHandlerSpy).toBeCalledWith(claimedServiceRequestCommand);

			claimedServiceRequestHandlerSpy.mockClear();
		});

		it("Create Service Request Command", async () => {
			const requestData = createMockRequest(RequestStatus.Open);

			const createServiceRequestHandlerSpy = jest.spyOn(createServiceRequestHandler, 'execute').mockImplementation();

			const createServiceRequestCommand: CreateServiceRequestCommand = new CreateServiceRequestCommand(requestData, mockBlockNumber());
			await commandBus.execute(createServiceRequestCommand);
			expect(createServiceRequestHandlerSpy).toBeCalled();
			expect(createServiceRequestHandlerSpy).toBeCalledWith(createServiceRequestCommand);

			createServiceRequestHandlerSpy.mockClear();
		});

		it("Finalized Service Request Command", async () => {
			const serviceInvoice = createMockServiceInvoice();

			const finalizedServiceRequestHandlerSpy = jest.spyOn(finalizedServiceRequestHandler, 'execute').mockImplementation();

			const finalizedServiceRequestCommand: FinalizedServiceRequestCommand = new FinalizedServiceRequestCommand(serviceInvoice, mockBlockNumber());
			await commandBus.execute(finalizedServiceRequestCommand);
			expect(finalizedServiceRequestHandlerSpy).toBeCalled();
			expect(finalizedServiceRequestHandlerSpy).toBeCalledWith(finalizedServiceRequestCommand);

			finalizedServiceRequestHandlerSpy.mockClear();
		});
    
		it("Processed Service Request Command", async () => {
			const serviceInvoice = createMockServiceInvoice();

			const processedServiceRequestHandlerSpy = jest.spyOn(processedServiceRequestHandler, 'execute').mockImplementation();

			const processedServiceRequestCommand: ProcessedServiceRequestCommand = new ProcessedServiceRequestCommand(serviceInvoice, mockBlockNumber());
			await commandBus.execute(processedServiceRequestCommand);
			expect(processedServiceRequestHandlerSpy).toBeCalled();
			expect(processedServiceRequestHandlerSpy).toBeCalledWith(processedServiceRequestCommand);

			processedServiceRequestHandlerSpy.mockClear();
		});
    
		it("Unstaked Service Request Command", async () => {
			const requestData = createMockRequest(RequestStatus.Unstaked);

			const unstakedServiceRequestHandlerSpy = jest.spyOn(unstakedServiceRequestHandler, 'execute').mockImplementation();

			const unstakedServiceRequestCommand: UnstakedServiceRequestCommand = new UnstakedServiceRequestCommand(requestData, mockBlockNumber());
			await commandBus.execute(unstakedServiceRequestCommand);
			expect(unstakedServiceRequestHandlerSpy).toBeCalled();
			expect(unstakedServiceRequestHandlerSpy).toBeCalledWith(unstakedServiceRequestCommand);

			unstakedServiceRequestHandlerSpy.mockClear();
		});
    
		it("Unstaked Waiting Service Request Command", async () => {
			const requestData = createMockRequest(RequestStatus.WaitingForUnstaked);

			const unstakedWaitingServiceRequestHandlerSpy = jest.spyOn(unstakedWaitingServiceRequestHandler, 'execute').mockImplementation();

			const unstakedWaitingServiceRequestCommand: UnstakedWaitingServiceRequestCommand = new UnstakedWaitingServiceRequestCommand(requestData, mockBlockNumber());
			await commandBus.execute(unstakedWaitingServiceRequestCommand);
			expect(unstakedWaitingServiceRequestHandlerSpy).toBeCalled();
			expect(unstakedWaitingServiceRequestHandlerSpy).toBeCalledWith(unstakedWaitingServiceRequestCommand);

			unstakedWaitingServiceRequestHandlerSpy.mockClear();
		});
	});
});