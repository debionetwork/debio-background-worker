import {
  Test,
  TestingModule
} from "@nestjs/testing";
import {
  LabCommandHandlers,
  LabDeregisteredCommand,
  LabRegisteredCommand,
  LabUpdatedCommand,
	LabUpdateVerificationStatusCommand
} from "../../../src/substrate/labs";
import { 
	LabDeregisteredHandler 
} from "../../../src/substrate/labs/commands/lab-deregistered/lab-deregistered.handler";
import { 
	LabRegisteredHandler 
} from "../../../src/substrate/labs/commands/lab-registered/lab-registered.handler";
import { 
	LabUpdatedHandler 
} from "../../../src/substrate/labs/commands/lab-updated/lab-updated.handler";
import { 
	LabUpdateVerificationStatusHandler
} from "../../../src/substrate/labs/commands/lab-update-verification-status/lab-update-verification-status.handler";
import {
  ElasticsearchService
} from "@nestjs/elasticsearch";
import { BlockMetaData } from "../../../src/substrate/models/blockMetaData";
import { ElasticSearchServiceProvider } from "../mock";
import { LabVerificationStatus } from "../../../src/substrate/labs/models/lab-verification-status";

let labDeregisteredHandler: LabDeregisteredHandler;
let labRegisteredHandler: LabRegisteredHandler;
let labUpdatedHandler: LabUpdatedHandler;
let labUpdateVerificationStatusHandler: LabUpdateVerificationStatusHandler;

let elasticsearchService: ElasticsearchService;
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
      providers: [
				ElasticsearchService,
				ElasticSearchServiceProvider,
				...LabCommandHandlers,
      ]
    }).compile();
    
		labDeregisteredHandler  						= modules.get<LabDeregisteredHandler>(LabDeregisteredHandler);
		labRegisteredHandler    						= modules.get<LabRegisteredHandler>(LabRegisteredHandler);
		labUpdatedHandler       						= modules.get<LabUpdatedHandler>(LabUpdatedHandler);
		labUpdateVerificationStatusHandler 	= modules.get<LabUpdateVerificationStatusHandler>(LabUpdateVerificationStatusHandler);

		elasticsearchService 	= modules.get<ElasticsearchService>(ElasticsearchService);
		
		await modules.init();
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
				verification_status: LabVerificationStatus.Verified,
				services: []
			});
			
			const labDeregisteredCommand: LabDeregisteredCommand = new LabDeregisteredCommand([lab], mockBlockNumber());
			await labDeregisteredHandler.execute(labDeregisteredCommand);
			expect(elasticsearchService.delete).toHaveBeenCalled();
		});
		
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
				verification_status: LabVerificationStatus.Verified,
				services: ["0xe2829ff8b96c52401dc9f89c5ce77df95868b5c9da2b7f70f04be1e423g563"]
			});
			
			const labDeregisteredCommand: LabDeregisteredCommand = new LabDeregisteredCommand([lab], mockBlockNumber());
			await labDeregisteredHandler.execute(labDeregisteredCommand);
			expect(elasticsearchService.delete).toHaveBeenCalled();
			expect(elasticsearchService.deleteByQuery).toHaveBeenCalled();
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
				verification_status: LabVerificationStatus.Verified,
				services: []
			});
			
			const labRegisteredCommand: LabDeregisteredCommand = new LabRegisteredCommand([lab], mockBlockNumber());
			await labRegisteredHandler.execute(labRegisteredCommand);
			expect(elasticsearchService.index).toHaveBeenCalled();
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
				verification_status: LabVerificationStatus.Verified,
				services: []
			});
			
			const labUpdatedCommand: LabUpdatedCommand = new LabUpdatedCommand([lab], mockBlockNumber());
			await labUpdatedHandler.execute(labUpdatedCommand);
			expect(elasticsearchService.update).toHaveBeenCalled();
			expect(elasticsearchService.updateByQuery).toHaveBeenCalled();
		});

		it("Lab Updated Verification Status Handler", async () => {
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
			
			const labUpdatedVerificationStatusCommand: LabUpdateVerificationStatusCommand = new LabUpdateVerificationStatusCommand([lab], mockBlockNumber());
			await labUpdateVerificationStatusHandler.execute(labUpdatedVerificationStatusCommand);
			expect(elasticsearchService.update).toHaveBeenCalled();
		});
	});
});