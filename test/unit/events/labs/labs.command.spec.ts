import {
  Test,
  TestingModule
} from "@nestjs/testing";
import { CommonModule } from "../../../../src/common/common.module";
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
  CommandBus,
  CqrsModule
} from "@nestjs/cqrs";
import {
  SubstrateController
} from "../../../../src/substrate/substrate.handler";
import { BlockMetaData } from "../../../../src/substrate/models/blockMetaData";
import { 
	CommandBusProvider, 
	ElasticSearchServiceProvider, 
	substrateServiceProvider 
} from "../../mock";

let labDeregisteredHandler: LabDeregisteredHandler;
let labRegisteredHandler: LabRegisteredHandler;
let labUpdatedHandler: LabUpdatedHandler;
let labUpdateVerificationStatusHandler: LabUpdateVerificationStatusHandler;

let commandBus: CommandBus;

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
          services: [], 
          certifications: [], 
          verificationStatus: [], 
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
				...LabCommandHandlers,
      ]
    }).compile();
    
		labDeregisteredHandler  						= modules.get<LabDeregisteredHandler>(LabDeregisteredHandler);
		labRegisteredHandler    						= modules.get<LabRegisteredHandler>(LabRegisteredHandler);
		labUpdatedHandler       						= modules.get<LabUpdatedHandler>(LabUpdatedHandler);
		labUpdateVerificationStatusHandler 	= modules.get<LabUpdateVerificationStatusHandler>(LabUpdateVerificationStatusHandler);

		commandBus						= modules.get<CommandBus>(CommandBus);
		
		await modules.init();
  });

  describe("Lab Handler", () => {
		it("Lab deregistered handler defined", () => {
			expect(labDeregisteredHandler).toBeDefined();
		});
		
		it("Lab registered handler defined", () => {
			expect(labRegisteredHandler).toBeDefined();
		});
		
		it("Lab updated handler defined", () => {
			expect(labUpdatedHandler).toBeDefined();
		});
		
		it("Lab verification status handler defined", () => {
			expect(labUpdateVerificationStatusHandler).toBeDefined();
		});
	});
  
	describe("Lab Command", () => {
		it("Lab Deregistered Command", async () => {
			const lab = createMockLab();
			
			const labDeregisteredHandlerSpy = jest.spyOn(labDeregisteredHandler, 'execute').mockImplementation();

			const labDeregisteredCommand: LabDeregisteredCommand = new LabDeregisteredCommand([lab], mockBlockNumber());
			await commandBus.execute(labDeregisteredCommand);
			expect(labDeregisteredHandlerSpy).toBeCalled();
			expect(labDeregisteredHandlerSpy).toBeCalledWith(labDeregisteredCommand);

			labDeregisteredHandlerSpy.mockClear();
		});

		
		it("Lab Registered Command", async () => {
			const lab = createMockLab();
			
			const labRegisteredHandlerSpy = jest.spyOn(labRegisteredHandler, 'execute').mockImplementation();

			const labRegisteredCommand: LabDeregisteredCommand = new LabRegisteredCommand([lab], mockBlockNumber());
			await commandBus.execute(labRegisteredCommand);
			expect(labRegisteredHandlerSpy).toBeCalled();
			expect(labRegisteredHandlerSpy).toBeCalledWith(labRegisteredCommand);

			labRegisteredHandlerSpy.mockClear();
		});

		it("Lab Updated Command", async () => {
			const lab = createMockLab();
			
			const labUpdateHandlerSpy = jest.spyOn(labUpdatedHandler, 'execute').mockImplementation();

			const labUpdatedCommand: LabUpdatedCommand = new LabUpdatedCommand([lab], mockBlockNumber());
			await commandBus.execute(labUpdatedCommand);
			expect(labUpdateHandlerSpy).toBeCalled();
			expect(labUpdateHandlerSpy).toBeCalledWith(labUpdatedCommand);

			labUpdateHandlerSpy.mockClear();
		});

		it("Lab Updated Verification Status Command", async () => {
			const lab = createMockLab();
			
			const labUpdateVerificationStatusHandlerSpy = jest.spyOn(labUpdateVerificationStatusHandler, 'execute').mockImplementation();

			const labUpdatedVerificationStatusCommand: LabUpdateVerificationStatusCommand = new LabUpdateVerificationStatusCommand([lab], mockBlockNumber());
			await commandBus.execute(labUpdatedVerificationStatusCommand);
			expect(labUpdateVerificationStatusHandlerSpy).toBeCalled();
			expect(labUpdateVerificationStatusHandlerSpy).toBeCalledWith(labUpdatedVerificationStatusCommand);

			labUpdateVerificationStatusHandlerSpy.mockClear();
		});
	});
});