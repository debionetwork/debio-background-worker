import { ExplorerService } from "@nestjs/cqrs/dist/services/explorer.service";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { Test, TestingModule } from "@nestjs/testing";
import { EthersModule } from "nestjs-ethers";
import { CommonModule } from "../../common/common.module";
import { SetLastRequestServiceBlockCommand } from "./blocks";
import { SetLastRequestServiceBlockHandler } from "./blocks/commands/set-last-request-service-block/set-last-request-service-block.handler";
import { GetLastRequestServiceBlockHandler } from "./blocks/queries/get-last-request-service-block/get-last-request-service-block.handler";
import { CreateServiceRequestCommand, RequestServiceCommandHandlers } from "./request-service";
import { RequestServiceController, RequestServiceService } from "./request-service.handler";
import { CreateServiceRequestHandler } from "./request-service/commands/create-service-request/create-service-request.handler";
import { BlockMetadata } from './request-service/models/blockMetadata';

describe("Request Service Ethereum", () => {
	let requestServiceController: RequestServiceController;
	let requestServiceService: RequestServiceService;
	let setLastRequestServiceBlockHandler: SetLastRequestServiceBlockHandler;
	let getLastRequestServiceBlockHandler: GetLastRequestServiceBlockHandler;
	let createServiceRequestHandler: CreateServiceRequestHandler;

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

	const RequestServiceServiceProvider = {
		provide: RequestServiceService,
		useFactory: () => ({
			handleEvent: jest.fn(),
			listenToEvents: jest.fn(),
			listenToNewBlock: jest.fn(),
			syncBlock: jest.fn(),
		})
	}

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				EthersModule.forRoot({
					network: process.env.WEB3_RPC,
					useDefaultProvider: true,
				}),
				CommonModule,
			],
			controllers: [RequestServiceController],
			providers: [
				ElasticsearchService,
				ElasticSearchServiceProvider,
				RequestServiceService,
				RequestServiceServiceProvider,
				SetLastRequestServiceBlockHandler,
				GetLastRequestServiceBlockHandler,
				{
					provide: GetLastRequestServiceBlockHandler,
					useFactory: () => ({
						execute: jest.fn().mockReturnValueOnce(1234)
					})
				},
				CreateServiceRequestHandler,
			],
		}).compile();

		requestServiceController = module.get<RequestServiceController>(RequestServiceController);
		requestServiceService = module.get<RequestServiceService>(RequestServiceService);
		setLastRequestServiceBlockHandler = module.get<SetLastRequestServiceBlockHandler>(SetLastRequestServiceBlockHandler);
		getLastRequestServiceBlockHandler = module.get<GetLastRequestServiceBlockHandler>(GetLastRequestServiceBlockHandler);
		createServiceRequestHandler = module.get<CreateServiceRequestHandler>(CreateServiceRequestHandler);
	});

	describe("Request Service Testing", () => {
		it("Request Service Controller must defined", () => {
			expect(requestServiceController).toBeDefined();
		});

		it("Request Service Service must defined", () => {
			expect(requestServiceService).toBeDefined();
		});
	});

	describe("Request Service onApplicationBootstrap", () => {
		it("Substrate onApplicationBootstrap called and call another method in substrate service", async () => {
			await requestServiceController.onApplicationBootstrap();

			expect(requestServiceService.syncBlock).toBeCalled();
			expect(requestServiceService.listenToEvents).toBeCalled();
			expect(requestServiceService.listenToNewBlock).toBeCalled();
		});
	});

	describe("Ethereum block request", () => {
		it("Set Last Request Service Block Handler", async () => {
			const lastBlockNumber = 12345;
			const setLastRequestServiceBlockHandlerSpy = jest.spyOn(setLastRequestServiceBlockHandler, "execute");
			const setLastRequestServiceBlockCommand: SetLastRequestServiceBlockCommand = new SetLastRequestServiceBlockCommand(lastBlockNumber);
			await setLastRequestServiceBlockHandler.execute(setLastRequestServiceBlockCommand);
			expect(setLastRequestServiceBlockHandlerSpy).toBeCalled();
			expect(setLastRequestServiceBlockHandlerSpy).toBeCalledWith(setLastRequestServiceBlockCommand);
		});

		it("Get Last Request Service Block Handler", async () => {
			const createServiceRequestHandlerSpy = jest.spyOn(getLastRequestServiceBlockHandler, "execute");
			let res = await getLastRequestServiceBlockHandler.execute();
			expect(createServiceRequestHandlerSpy).toBeCalled();
			expect(res).toBe(1234);
			expect(createServiceRequestHandlerSpy).toHaveReturnedWith(expect.any(Number));
		});

		it("Create Service Request Handler", async () => {
			const mockArgs = ["", "", "", "", "", "", "", "", ""];
			const mockBlockNumber: BlockMetadata = {blockHash: "", blockNumber: 12345, transactionHash: ""};
			
			const createServiceRequestHandlerSpy = jest.spyOn(createServiceRequestHandler, "execute");
			const createServiceRequestCommand: CreateServiceRequestCommand = new CreateServiceRequestCommand(mockArgs, mockBlockNumber);
			await createServiceRequestHandler.execute(createServiceRequestCommand);
			expect(createServiceRequestHandlerSpy).toBeCalled();
			expect(createServiceRequestHandlerSpy).toBeCalledWith(createServiceRequestCommand);
		});
	});
});