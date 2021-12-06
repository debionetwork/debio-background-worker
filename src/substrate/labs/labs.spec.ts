import { 
  Test, 
  TestingModule 
} from "@nestjs/testing";
import { CommonModule } from "../../common/common.module";
import { 
  LabCommandHandlers, 
  LabDeregisteredCommand, 
  LabRegisteredCommand, 
  LabUpdatedCommand 
} from ".";
import { LabDeregisteredHandler } from "./commands/lab-deregistered/lab-deregistered.handler";
import { LabRegisteredHandler } from "./commands/lab-registered/lab-registered.handler";
import { LabUpdatedHandler } from "./commands/lab-updated/lab-updated.handler";
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
} from "../substrate.handler";
import { BlockMetaData } from "../models/blockMetaData";

describe("Labs Substrate Event Handler", () => {
	let labDeregisteredHandler: LabDeregisteredHandler;
	let labRegisteredHandler: LabRegisteredHandler;
	let labUpdatedHandler: LabUpdatedHandler;

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
    
		labDeregisteredHandler  = modules.get<LabDeregisteredHandler>(LabDeregisteredHandler);
		labRegisteredHandler    = modules.get<LabRegisteredHandler>(LabRegisteredHandler);
		labUpdatedHandler       = modules.get<LabUpdatedHandler>(LabUpdatedHandler);
  });
  
	describe("Lab Handler", () => {
		it("Lab Deregistered Handler", async () => {
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
				verification_status: "",
				services: []
			});
			
			const labDeregisteredHandlerSpy = jest.spyOn(labDeregisteredHandler, 'execute');
			const labDeregisteredCommand: LabDeregisteredCommand = new LabDeregisteredCommand([lab], mockBlockNumber());
			await labDeregisteredHandler.execute(labDeregisteredCommand);
			expect(labDeregisteredHandlerSpy).toBeCalled();
			expect(labDeregisteredHandlerSpy).toBeCalledWith(labDeregisteredCommand);
		});

		
		it("Lab Registered Handler", async () => {
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
				verification_status: "",
				services: []
			});
			
			const labRegisteredHandlerSpy = jest.spyOn(labRegisteredHandler, 'execute');
			const labRegisteredCommand: LabDeregisteredCommand = new LabRegisteredCommand([lab], mockBlockNumber());
			await labRegisteredHandler.execute(labRegisteredCommand);
			expect(labRegisteredHandlerSpy).toBeCalled();
			expect(labRegisteredHandlerSpy).toBeCalledWith(labRegisteredCommand);
		});

		it("Lab Updated Handler", async () => {
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
				verification_status: "",
				services: []
			});
			
			const labUpdateHandlerSpy = jest.spyOn(labUpdatedHandler, 'execute');
			const labUpdatedCommand: LabUpdatedCommand = new LabUpdatedCommand([lab], mockBlockNumber());
			await labUpdatedHandler.execute(labUpdatedCommand);
			expect(labUpdateHandlerSpy).toBeCalled();
			expect(labUpdateHandlerSpy).toBeCalledWith(labUpdatedCommand);
		});
	});
});