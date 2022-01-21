import {
	ElasticsearchService
} from "@nestjs/elasticsearch";
import {
	Test,
	TestingModule
} from "@nestjs/testing";
import { ElasticSearchServiceProvider } from "../../mock";
import { BlockMetaData } from "../../../../src/substrate/models/blockMetaData";
import {
	CertificationCreatedCommand,
	CertificationDeletedCommand,
	CertificationsCommandHandlers,
	CertificationUpdatedCommand
} from "../../../../src/substrate/events/certifications";
import { CertificationCreatedHandler } from "../../../../src/substrate/events/certifications/commands/certification-created/certification-created.handler";
import { CertificationUpdatedHandler } from "../../../../src/substrate/events/certifications/commands/certification-updated/certification-updated.handler";
import { CertificationDeletedHandler } from "../../../../src/substrate/events/certifications/commands/certification-deleted/certification-deleted.handler";

let certificationsCreatedHandler: CertificationCreatedHandler;
let certificationsUpdatedHandler: CertificationUpdatedHandler;
let certificationsDeletedHandler: CertificationDeletedHandler;

let elasticsearchService: ElasticsearchService;

describe("Certifications Substrate Event Handler", () => {

	const createMockCertifications = () => {
    const info = {
      title: "string",
      issuer: "string",
      month: "string",
      year: "string",
      description: "string",
      supportingDocument: 'string'
    }
		return {
      toHuman: jest.fn(
        () => ({
          id: "string",
          ownerId: "string",
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