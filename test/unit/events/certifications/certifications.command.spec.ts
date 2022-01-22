import {
	CommandBus,
	CqrsModule
} from "@nestjs/cqrs";
import {
	Test,
	TestingModule
} from "@nestjs/testing";
import { BlockMetaData } from "../../../../src/substrate/models/blockMetaData";
import {
	SubstrateController
} from "../../../../src/substrate/substrate.handler";
import { CommonModule } from "../../../../src/common/common.module";
import {
	CertificationCreatedCommand,
	CertificationDeletedCommand,
	CertificationsCommandHandlers,
	CertificationUpdatedCommand
} from "../../../../src/substrate/events/certifications";
import { CertificationCreatedHandler } from "../../../../src/substrate/events/certifications/commands/certification-created/certification-created.handler";
import { CertificationUpdatedHandler } from "../../../../src/substrate/events/certifications/commands/certification-updated/certification-updated.handler";
import { CertificationDeletedHandler } from "../../../../src/substrate/events/certifications/commands/certification-deleted/certification-deleted.handler";
import { CommandBusProvider, ElasticSearchServiceProvider, substrateServiceProvider } from "../../mock";

let certificationsCreatedHandler: CertificationCreatedHandler;
let certificationsUpdatedHandler: CertificationUpdatedHandler;
let certificationsDeletedHandler: CertificationDeletedHandler;

let commandBus: CommandBus;

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
        ...CertificationsCommandHandlers
      ]
    }).compile();
    
		certificationsCreatedHandler  = modules.get<CertificationCreatedHandler>(CertificationCreatedHandler);
		certificationsUpdatedHandler  = modules.get<CertificationUpdatedHandler>(CertificationUpdatedHandler);
		certificationsDeletedHandler  = modules.get<CertificationDeletedHandler>(CertificationDeletedHandler);
		
		commandBus						= modules.get<CommandBus>(CommandBus);
		
		await modules.init();
  });

  describe("Certification Handler defined", () => {
		it("Certification created handler", () => {
			expect(certificationsCreatedHandler).toBeDefined();
		});
		
		it("Certification updated handler", () => {
			expect(certificationsUpdatedHandler).toBeDefined();
		});
		
		it("Certification deleted handler", () => {
			expect(certificationsDeletedHandler).toBeDefined();
		});
	});

	describe("Certification Command", () => {
		it("Certification Created Command", async () => {
			const certifications = createMockCertifications();
			
			const certificationCreatedHandlerSpy = jest.spyOn(certificationsCreatedHandler, 'execute').mockImplementation();

			const certificationCreatedCommand: CertificationCreatedCommand = new CertificationCreatedCommand([certifications], mockBlockNumber());
			await commandBus.execute(certificationCreatedCommand);
			expect(certificationCreatedHandlerSpy).toBeCalled();
			expect(certificationCreatedHandlerSpy).toBeCalledWith(certificationCreatedCommand);
			
			certificationCreatedHandlerSpy.mockClear();
		});
    
		it("Certification Updated Command", async () => {
			const certifications = createMockCertifications();
			
			const certificationUpdatedHandlerSpy = jest.spyOn(certificationsUpdatedHandler, 'execute').mockImplementation();

			const certificationUpdatedCommand: CertificationUpdatedCommand = new CertificationUpdatedCommand([certifications], mockBlockNumber());
			await commandBus.execute(certificationUpdatedCommand);
			expect(certificationUpdatedHandlerSpy).toBeCalled();
			expect(certificationUpdatedHandlerSpy).toBeCalledWith(certificationUpdatedCommand);

			certificationUpdatedHandlerSpy.mockClear();
		});

		it("Certification Deleted Command", async () => {
			const certifications = createMockCertifications();
			
			const certificationDeletedHandlerSpy = jest.spyOn(certificationsDeletedHandler, 'execute').mockImplementation();

			const certificationDeletedCommand: CertificationDeletedCommand = new CertificationDeletedCommand([certifications], mockBlockNumber());
			await commandBus.execute(certificationDeletedCommand);
			expect(certificationDeletedHandlerSpy).toBeCalled();
			expect(certificationDeletedHandlerSpy).toBeCalledWith(certificationDeletedCommand);

			certificationDeletedHandlerSpy.mockClear();
		});
	});
});