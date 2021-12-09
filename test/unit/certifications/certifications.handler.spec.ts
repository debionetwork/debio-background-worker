import {
	ElasticsearchService
} from "@nestjs/elasticsearch";
import {
	Test,
	TestingModule
} from "@nestjs/testing";
import { ElasticSearchServiceProvider } from "../mock";
import { BlockMetaData } from "../../../src/substrate/models/blockMetaData";
import {
	CertificationCreatedCommand,
	CertificationDeletedCommand,
	CertificationsCommandHandlers,
	CertificationUpdatedCommand
} from "../../../src/substrate/certifications";
import { CertificationCreatedHandler } from "../../../src/substrate/certifications/commands/certification-created/certification-created.handler";
import { CertificationUpdatedHandler } from "../../../src/substrate/certifications/commands/certification-updated/certification-updated.handler";
import { CertificationDeletedHandler } from "../../../src/substrate/certifications/commands/certification-deleted/certification-deleted.handler";

let certificationsCreatedHandler: CertificationCreatedHandler;
let certificationsUpdatedHandler: CertificationUpdatedHandler;
let certificationsDeletedHandler: CertificationDeletedHandler;

let elasticsearchService: ElasticsearchService;

describe("Certifications Substrate Event Handler", () => {

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
      providers: [
				ElasticsearchService,
				ElasticSearchServiceProvider,
        ...CertificationsCommandHandlers
      ]
    }).compile();
    
		certificationsCreatedHandler  = modules.get<CertificationCreatedHandler>(CertificationCreatedHandler);
		certificationsUpdatedHandler  = modules.get<CertificationUpdatedHandler>(CertificationUpdatedHandler);
		certificationsDeletedHandler  = modules.get<CertificationDeletedHandler>(CertificationDeletedHandler);
		
		elasticsearchService 	= modules.get<ElasticsearchService>(ElasticsearchService);
		
		await modules.init();
  });
  
	describe("Certification Handler", () => {
		it("Certification Created Handler", async () => {
			const certifications = createMockCertifications();
			
			const certificationCreatedCommand: CertificationCreatedCommand = new CertificationCreatedCommand([certifications], mockBlockNumber());
			
			await certificationsCreatedHandler.execute(certificationCreatedCommand);
			expect(elasticsearchService.index).toHaveBeenCalled();
			expect(elasticsearchService.update).toHaveBeenCalled();
		});
    
		it("Certification Updated Handler", async () => {
			const certifications = createMockCertifications();
			
			const certificationUpdatedCommand: CertificationUpdatedCommand = new CertificationUpdatedCommand([certifications], mockBlockNumber());

			await certificationsUpdatedHandler.execute(certificationUpdatedCommand);
			expect(elasticsearchService.update).toHaveBeenCalled();
		});

		it("Certification Deleted Handler", async () => {
			const certifications = createMockCertifications();
			
			const certificationDeletedCommand: CertificationDeletedCommand = new CertificationDeletedCommand([certifications], mockBlockNumber());
			
			await certificationsDeletedHandler.execute(certificationDeletedCommand);
			expect(elasticsearchService.delete).toBeCalled();
			expect(elasticsearchService.update).toHaveBeenCalled();
		});
	});
});