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
import {
	CertificationCreatedCommand,
	CertificationDeletedCommand,
	CertificationsCommandHandlers,
	CertificationUpdatedCommand
} from "../../src/substrate/certifications";
import { CertificationCreatedHandler } from "../../src/substrate/certifications/commands/certification-created/certification-created.handler";
import { CertificationUpdatedHandler } from "../../src/substrate/certifications/commands/certification-updated/certification-updated.handler";
import { CertificationDeletedHandler } from "../../src/substrate/certifications/commands/certification-deleted/certification-deleted.handler";

describe("Certifications Substrate Event Handler", () => {
	let certificationsCreatedHandler: CertificationCreatedHandler;
	let certificationsUpdatedHandler: CertificationUpdatedHandler;
	let certificationsDeletedHandler: CertificationDeletedHandler;

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
  
	const createMockCertifications = () => {
    const info = {
      title: "Test1",
      issuer: "Test Issuer",
      month: "January",
      year: "2021",
      description: "Testing Mock Certification",
      supportingDocument: null
    }
		return {
      toHuman: jest.fn(
        () => ({
          id: "0xe2829ff8b96c52401dc9f89c5ce77df95868b5c9da2b7f70f04be1e423g563",
          ownerId: "5ESGhRuAhECXu96Pz9L8pwEEd1AeVhStXX67TWE1zTEA62U",
          info: info
        })
      )
    }
  }

	function mockBlockNumber(): BlockMetaData {
		return {
			blockHash: "",
			blockNumber: 1
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
        ...CertificationsCommandHandlers
      ]
    }).compile();
    
		certificationsCreatedHandler  = modules.get<CertificationCreatedHandler>(CertificationCreatedHandler);
		certificationsUpdatedHandler  = modules.get<CertificationUpdatedHandler>(CertificationUpdatedHandler);
		certificationsDeletedHandler  = modules.get<CertificationDeletedHandler>(CertificationDeletedHandler);
  });
  
	describe("Certification Handler", () => {
		it("Certification Created Handler", async () => {
			const certifications = createMockCertifications();
			
			const certificationCreatedHandlerSpy = jest.spyOn(certificationsCreatedHandler, 'execute');
			const certificationCreatedCommand: CertificationCreatedCommand = new CertificationCreatedCommand([certifications], mockBlockNumber());
			await certificationsCreatedHandler.execute(certificationCreatedCommand);
			expect(certificationCreatedHandlerSpy).toBeCalled();
			expect(certificationCreatedHandlerSpy).toBeCalledWith(certificationCreatedCommand);
		});
    
		it("Certification Updated Handler", async () => {
			const certifications = createMockCertifications();
			
			const certificationUpdatedHandlerSpy = jest.spyOn(certificationsUpdatedHandler, 'execute');
			const certificationUpdatedCommand: CertificationUpdatedCommand = new CertificationUpdatedCommand([certifications], mockBlockNumber());
			await certificationsUpdatedHandler.execute(certificationUpdatedCommand);
			expect(certificationUpdatedHandlerSpy).toBeCalled();
			expect(certificationUpdatedHandlerSpy).toBeCalledWith(certificationUpdatedCommand);
		});

		it("Certification Deleted Handler", async () => {
			const certifications = createMockCertifications();
			
			const certificationDeletedHandlerSpy = jest.spyOn(certificationsDeletedHandler, 'execute');
			const certificationDeletedCommand: CertificationDeletedCommand = new CertificationDeletedCommand([certifications], mockBlockNumber());
			await certificationsDeletedHandler.execute(certificationDeletedCommand);
			expect(certificationDeletedHandlerSpy).toBeCalled();
			expect(certificationDeletedHandlerSpy).toBeCalledWith(certificationDeletedCommand);
		});
	});
});