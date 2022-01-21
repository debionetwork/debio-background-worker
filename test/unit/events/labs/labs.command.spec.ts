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
  ElasticsearchModule,
  ElasticsearchService
} from "@nestjs/elasticsearch";
import {
  CommandBus,
  CqrsModule
} from "@nestjs/cqrs";
import {
  SubstrateController,
  SubstrateService
} from "../../../../src/substrate/substrate.handler";
import { BlockMetaData } from "../../../../src/substrate/models/blockMetaData";
import { 
	CommandBusProvider, 
	ElasticSearchServiceProvider, 
	substrateServiceProvider 
} from "../../mock";
import { LabVerificationStatus } from "../../../../src/substrate/events/labs/models/lab-verification-status";

let labDeregisteredHandler: LabDeregisteredHandler;
let labRegisteredHandler: LabRegisteredHandler;
let labUpdatedHandler: LabUpdatedHandler;
let labUpdateVerificationStatusHandler: LabUpdateVerificationStatusHandler;

let commandBus: CommandBus;

describe("Labs Substrate Event Handler", () => {
  
	const createMockLab = ({
		address,
		box_public_key,
		city,
		country,
		email,
		phone_number,
		website,
		latitude,
		longitude,
		name,
		profile_image,
		region,
		account_id,
		certifications,
		verification_status,
		services,
	}) => {
		const labInfo = {
			boxPublicKey: box_public_key, 
			name: name, 
			email: email, 
			phoneNumber: phone_number, 
			website: website, 
			country: country, 
			region: region, 
			city: city, 
			address: address, 
			latitude: latitude, 
			longitude: longitude, 
			profileImage: profile_image
		};

		return {
      toHuman: jest.fn(
        () => ({
          accountId: account_id, 
          services: services, 
          certifications: certifications, 
          verificationStatus: verification_status, 
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
			const lab = createMockLab({
				address: "Jakarta",
				box_public_key: "0xe2829ff8b96c52401dc9f89c5ce77df95868b5c9da2b7f70f04be1e423g563",
				city: "ID-JK",
				country: "ID",
				email: "email@labdnafavorit.com",
				phone_number: "+8272282",
				website: "http://localhost",
				latitude: null,
				longitude: null,
				name: "Laboratorium DNA Favourites",
				profile_image: null,
				region: "ID-JK",
				account_id: "5ESGhRuAhECXu96Pz9L8pwEEd1AeVhStXX67TWE1zTEA62U",
				certifications: [],
				verification_status: LabVerificationStatus.Verified,
				services: []
			});
			
			const labDeregisteredHandlerSpy = jest.spyOn(labDeregisteredHandler, 'execute');
			const labDeregisteredCommand: LabDeregisteredCommand = new LabDeregisteredCommand([lab], mockBlockNumber());
			await commandBus.execute(labDeregisteredCommand);
			expect(labDeregisteredHandlerSpy).toBeCalled();
			expect(labDeregisteredHandlerSpy).toBeCalledWith(labDeregisteredCommand);
		});

		
		it("Lab Registered Command", async () => {
			const lab = createMockLab({
				address: "Jakarta",
				box_public_key: "0xe2829ff8b96c52401dc9f89c5ce77df95868b5c9da2b7f70f04be1e423g563",
				city: "ID-JK",
				country: "ID",
				email: "email@labdnafavorit.com",
				phone_number: "+8272282",
				website: "http://localhost",
				latitude: null,
				longitude: null,
				name: "Laboratorium DNA Favourites",
				profile_image: null,
				region: "ID-JK",
				account_id: "5ESGhRuAhECXu96Pz9L8pwEEd1AeVhStXX67TWE1zTEA62U",
				certifications: [],
				verification_status: LabVerificationStatus.Verified,
				services: []
			});
			
			const labRegisteredHandlerSpy = jest.spyOn(labRegisteredHandler, 'execute');
			const labRegisteredCommand: LabDeregisteredCommand = new LabRegisteredCommand([lab], mockBlockNumber());
			await commandBus.execute(labRegisteredCommand);
			expect(labRegisteredHandlerSpy).toBeCalled();
			expect(labRegisteredHandlerSpy).toBeCalledWith(labRegisteredCommand);
		});

		it("Lab Updated Command", async () => {
			const lab = createMockLab({
				address: "Jakarta",
				box_public_key: "0xe2829ff8b96c52401dc9f89c5ce77df95868b5c9da2b7f70f04be1e423g563",
				city: "ID-JK",
				country: "ID",
				email: "email@labdnafavorit.com",
				phone_number: "+8272282",
				website: "http://localhost",
				latitude: null,
				longitude: null,
				name: "Laboratorium DNA Favourites",
				profile_image: null,
				region: "ID-JK",
				account_id: "5ESGhRuAhECXu96Pz9L8pwEEd1AeVhStXX67TWE1zTEA62U",
				certifications: [],
				verification_status: LabVerificationStatus.Verified,
				services: []
			});
			
			const labUpdateHandlerSpy = jest.spyOn(labUpdatedHandler, 'execute');
			const labUpdatedCommand: LabUpdatedCommand = new LabUpdatedCommand([lab], mockBlockNumber());
			await commandBus.execute(labUpdatedCommand);
			expect(labUpdateHandlerSpy).toBeCalled();
			expect(labUpdateHandlerSpy).toBeCalledWith(labUpdatedCommand);
		});

		it("Lab Updated Verification Status Command", async () => {
			const lab = createMockLab({
				address: "Jakarta",
				box_public_key: "0xe2829ff8b96c52401dc9f89c5ce77df95868b5c9da2b7f70f04be1e423g563",
				city: "ID-JK",
				country: "ID",
				email: "email@labdnafavorit.com",
				phone_number: "+8272282",
				website: "http://localhost",
				latitude: null,
				longitude: null,
				name: "Laboratorium DNA Favourites",
				profile_image: null,
				region: "ID-JK",
				account_id: "5ESGhRuAhECXu96Pz9L8pwEEd1AeVhStXX67TWE1zTEA62U",
				certifications: [],
				verification_status: LabVerificationStatus.Verified,
				services: []
			});
			
			const labUpdateVerificationStatusHandlerSpy = jest.spyOn(labUpdateVerificationStatusHandler, 'execute');
			const labUpdatedVerificationStatusCommand: LabUpdateVerificationStatusCommand = new LabUpdateVerificationStatusCommand([lab], mockBlockNumber());
			await commandBus.execute(labUpdatedVerificationStatusCommand);
			expect(labUpdateVerificationStatusHandlerSpy).toBeCalled();
			expect(labUpdateVerificationStatusHandlerSpy).toBeCalledWith(labUpdatedVerificationStatusCommand);
		});
	});
});