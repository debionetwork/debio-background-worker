import { CommandBus, CqrsModule } from "@nestjs/cqrs";
import { ElasticsearchModule, ElasticsearchService } from "@nestjs/elasticsearch";
import { Test, TestingModule } from "@nestjs/testing";
import { BlockMetaData } from "../models/blockMetaData";
import { SubstrateController, SubstrateService } from "../substrate.handler";
import { CommonModule } from "../../common/common.module";
import { ClaimedServiceRequestHandler } from "./commands/claimed-service-request/claimed-service-request.handler";
import { CreateServiceRequestHandler } from "./commands/create-service-request/create-service-request.handler";
import { FinalizedServiceRequestHandler } from "./commands/finalized-service-request/finalized-service-request.handler";
import { ProcessedServiceRequestHandler } from "./commands/processed-service-request/processed-service-request.handler";
import { UnstakedServiceRequestHandler } from "./commands/unstaked-service-request/unstaked-service-request.handler";
import { UnstakedWaitingServiceRequestHandler } from "./commands/unstakedwaiting-service-request/unstakedwaiting-service-request.handler";
import { RequestServiceCommandHandlers } from ".";
import { RequestStatus } from "./models/requestStatus";

describe("Service Request Substrate Event Handler", () => {
	let claimedServiceRequestHandler: ClaimedServiceRequestHandler;
	let createServiceRequestHandler: CreateServiceRequestHandler;
	let finalizedServiceRequestHandler: FinalizedServiceRequestHandler;
  let processedServiceRequestHandler: ProcessedServiceRequestHandler;
  let unstakedServiceRequestHandler: UnstakedServiceRequestHandler;
  let unstakedWaitingServiceRequestHandler: UnstakedWaitingServiceRequestHandler;

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

  const createMockClaimRequest = () => {
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
  });
  
	describe("Service Request Event", () => {
		it("Claimed Service Request Handler", async () => {

		});

		it("Create Service Request Handler", async () => {

		});

		it("Finalized Service Request Handler", async () => {

		});
    
		it("Processed Service Request Handler", async () => {

		});
    
		it("Unstaked Service Request Handler", async () => {

		});
    
		it("Unstaked Waiting Service Request Handler", async () => {

		});
	});
});