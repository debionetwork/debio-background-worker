import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { ClaimedServiceRequestHandler } from '../../../../../src/indexer/events/service-request/commands/claimed-service-request/claimed-service-request.handler';
import { CreateServiceRequestHandler } from '../../../../../src/indexer/events/service-request/commands/create-service-request/create-service-request.handler';
import { FinalizedServiceRequestHandler } from '../../../../../src/indexer/events/service-request/commands/finalized-service-request/finalized-service-request.handler';
import { ProcessedServiceRequestHandler } from '../../../../../src/indexer/events/service-request/commands/processed-service-request/processed-service-request.handler';
import { UnstakedServiceRequestHandler } from '../../../../../src/indexer/events/service-request/commands/unstaked-service-request/unstaked-service-request.handler';
import { UnstakedWaitingServiceRequestHandler } from '../../../../../src/indexer/events/service-request/commands/unstakedwaiting-service-request/unstakedwaiting-service-request.handler';
import {
  ClaimedServiceRequestCommandIndexer,
  CreateServiceRequestCommandIndexer,
  FinalizedServiceRequestCommandIndexer,
  ProcessedServiceRequestCommandIndexer,
  RequestServiceCommandHandlers,
  UnstakedServiceRequestCommandIndexer,
  UnstakedWaitingServiceRequestCommandIndexer,
} from '../../../../../src/indexer/events/service-request';
import { RequestStatus } from '../../../../../src/indexer/models/service-request/request-status';
import { BlockMetaData } from '../../../../../src/indexer/models/block-meta-data';
import {
  createObjectSearchCountryServiceRequest,
  createObjectSearchServiceRequest,
  ElasticSearchServiceProvider,
} from '../../../mock';
import { when } from 'jest-when';

let claimedServiceRequestHandler: ClaimedServiceRequestHandler;
let createServiceRequestHandler: CreateServiceRequestHandler;
let finalizedServiceRequestHandler: FinalizedServiceRequestHandler;
let processedServiceRequestHandler: ProcessedServiceRequestHandler;
let unstakedServiceRequestHandler: UnstakedServiceRequestHandler;
let unstakedWaitingServiceRequestHandler: UnstakedWaitingServiceRequestHandler;

let elasticsearchService: ElasticsearchService;

describe('Service Request Substrate Event Handler', () => {
  const createMockRequest = (requestStatus: RequestStatus) => {
    return [
      {},
      {
        toHuman: jest.fn(() => ({
          hash_: 'string',
          requesterAddress: 'string',
          labAddress: 'string',
          country: 'XX',
          region: 'XX',
          city: 'XX',
          serviceCategory: 'Test',
          stakingAmount: '1000000000000',
          status: requestStatus,
          createdAt: '1',
          updatedAt: '1',
          unstakedAt: '1',
        })),
      },
    ];
  };

  const createMockServiceInvoice = () => {
    return [
      {},
      {
        toHuman: jest.fn(() => ({
          requestHash: '',
          orderId: '',
          serviceId: '',
          customerAddress: '',
          sellerAddress: '',
          dnaSampleTrackingId: '',
          servicePrice: {
            assetId: '1',
            testingPrice: 1,
            qcPrice: 1,
          }
        })),
      },
    ];
  };

  const createMockClaimRequest = (): Array<any> => {
    return [
      {},
      {
        toHuman: jest.fn(() => ({
          requestHash: '',
          labAddress: '',
          serviceId: '',
          testingPrice: '',
          qcPrice: '',
        })),
      },
    ];
  };

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: '',
      blockNumber: 1,
    };
  }

  beforeAll(async () => {
    const modules: TestingModule = await Test.createTestingModule({
      providers: [
        ElasticSearchServiceProvider,
        ...RequestServiceCommandHandlers,
      ],
    }).compile();

    claimedServiceRequestHandler = modules.get<ClaimedServiceRequestHandler>(
      ClaimedServiceRequestHandler,
    );
    createServiceRequestHandler = modules.get<CreateServiceRequestHandler>(
      CreateServiceRequestHandler,
    );
    finalizedServiceRequestHandler =
      modules.get<FinalizedServiceRequestHandler>(
        FinalizedServiceRequestHandler,
      );
    processedServiceRequestHandler =
      modules.get<ProcessedServiceRequestHandler>(
        ProcessedServiceRequestHandler,
      );
    unstakedServiceRequestHandler = modules.get<UnstakedServiceRequestHandler>(
      UnstakedServiceRequestHandler,
    );
    unstakedWaitingServiceRequestHandler =
      modules.get<UnstakedWaitingServiceRequestHandler>(
        UnstakedWaitingServiceRequestHandler,
      );

    elasticsearchService =
      modules.get<ElasticsearchService>(ElasticsearchService);

    await modules.init();
  });

  describe('Service Request Handler', () => {
    it('Claimed service request handler defined', () => {
      expect(claimedServiceRequestHandler).toBeDefined();
    });

    it('Created service request handler defined', () => {
      expect(createServiceRequestHandler).toBeDefined();
    });

    it('Finalized service request handler defined', () => {
      expect(finalizedServiceRequestHandler).toBeDefined();
    });

    it('Processed service request handler defined', () => {
      expect(processedServiceRequestHandler).toBeDefined();
    });

    it('Unstaked service request handler defined', () => {
      expect(unstakedServiceRequestHandler).toBeDefined();
    });

    it('Unstaked waiting service request handler defined', () => {
      expect(unstakedWaitingServiceRequestHandler).toBeDefined();
    });
  });

  describe('Service Request Event', () => {
    it('Claimed Service Request Handler', async () => {
      const claimRequest = createMockClaimRequest();

      const claimedServiceRequestCommand: ClaimedServiceRequestCommandIndexer =
        new ClaimedServiceRequestCommandIndexer(
          claimRequest,
          mockBlockNumber(),
        );

      const SERVICE_REQUEST_CALLED_WITH = createObjectSearchServiceRequest(
        claimedServiceRequestCommand.claimRequest.requestHash,
      );
      const ES_RESULT_SERVICE_REQUEST = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  request: {
                    country: 'string',
                  },
                },
              },
            ],
          },
        },
      };

      when(elasticsearchService.search)
        .calledWith(SERVICE_REQUEST_CALLED_WITH)
        .mockReturnValue(ES_RESULT_SERVICE_REQUEST);

      await claimedServiceRequestHandler.execute(claimedServiceRequestCommand);
      expect(elasticsearchService.update).toHaveBeenCalledTimes(2);
    });

    it('Create Service Request Handler WHEN COUTRY SERVICE REQUEST HITS 0', async () => {
      const requestData = createMockRequest(RequestStatus.Open);

      const createServiceRequestCommand: CreateServiceRequestCommandIndexer =
        new CreateServiceRequestCommandIndexer(requestData, mockBlockNumber());

      const COUNTRY_CALLED_WITH = createObjectSearchCountryServiceRequest(
        createServiceRequestCommand.request.country,
      );
      const ES_RESULT_COUNTRY_SERVICE_REQUEST = {
        body: {
          hits: {
            hits: [],
          },
        },
      };

      when(elasticsearchService.search)
        .calledWith(COUNTRY_CALLED_WITH)
        .mockReturnValue(ES_RESULT_COUNTRY_SERVICE_REQUEST);

      await createServiceRequestHandler.execute(createServiceRequestCommand);
      expect(elasticsearchService.create).toHaveBeenCalled();
      expect(elasticsearchService.search).toHaveBeenCalled();
      expect(elasticsearchService.index).toHaveBeenCalled();
    });

    it('Create Service Request Handler WHEN COUTRY SERVICE REQUEST HITS MORE THAN 0', async () => {
      const requestData = createMockRequest(RequestStatus.Open);

      const COUNTRY_ID = 'string';
      const COUNTRY_CALLED_WITH =
        createObjectSearchCountryServiceRequest(COUNTRY_ID);
      const ES_RESULT_COUNTRY_SERVICE_REQUEST = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  request: {
                    country: 'string',
                  },
                },
              },
            ],
          },
        },
      };

      when(elasticsearchService.search)
        .calledWith(COUNTRY_CALLED_WITH)
        .mockReturnValue(ES_RESULT_COUNTRY_SERVICE_REQUEST);

      const createServiceRequestCommand: CreateServiceRequestCommandIndexer =
        new CreateServiceRequestCommandIndexer(requestData, mockBlockNumber());
      await createServiceRequestHandler.execute(createServiceRequestCommand);
      expect(elasticsearchService.create).toHaveBeenCalled();
      expect(elasticsearchService.search).toHaveBeenCalled();
      expect(elasticsearchService.update).toHaveBeenCalled();
    });

    it('Finalized Service Request Handler', async () => {
      const serviceInvoice = createMockServiceInvoice();

      const finalizedServiceRequestCommand: FinalizedServiceRequestCommandIndexer =
        new FinalizedServiceRequestCommandIndexer(
          serviceInvoice,
          mockBlockNumber(),
        );

      const SERVICE_REQUEST_CALLED_WITH = createObjectSearchServiceRequest(
        finalizedServiceRequestCommand.serviceInvoice.requestHash,
      );
      const ES_RESULT_SERVICE_REQUEST = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  request: {
                    country: 'string',
                  },
                },
              },
            ],
          },
        },
      };

      when(elasticsearchService.search)
        .calledWith(SERVICE_REQUEST_CALLED_WITH)
        .mockReturnValue(ES_RESULT_SERVICE_REQUEST);

      await finalizedServiceRequestHandler.execute(
        finalizedServiceRequestCommand,
      );
      expect(elasticsearchService.update).toHaveBeenCalled();
    });

    it('Processed Service Request Handler', async () => {
      const serviceInvoice = createMockServiceInvoice();

      const processedServiceRequestCommand: ProcessedServiceRequestCommandIndexer =
        new ProcessedServiceRequestCommandIndexer(
          serviceInvoice,
          mockBlockNumber(),
        );

      const SERVICE_REQUEST_CALLED_WITH = createObjectSearchServiceRequest(
        processedServiceRequestCommand.serviceInvoice.requestHash,
      );
      const ES_RESULT_SERVICE_REQUEST = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  request: {
                    country: 'string',
                  },
                },
              },
            ],
          },
        },
      };

      when(elasticsearchService.search)
        .calledWith(SERVICE_REQUEST_CALLED_WITH)
        .mockReturnValue(ES_RESULT_SERVICE_REQUEST);

      await processedServiceRequestHandler.execute(
        processedServiceRequestCommand,
      );
      expect(elasticsearchService.update).toHaveBeenCalled();
    });

    it('Unstaked Service Request Handler', async () => {
      const requestData = createMockRequest(RequestStatus.Unstaked);

      const unstakedServiceRequestCommand: UnstakedServiceRequestCommandIndexer =
        new UnstakedServiceRequestCommandIndexer(
          requestData,
          mockBlockNumber(),
        );
      await unstakedServiceRequestHandler.execute(
        unstakedServiceRequestCommand,
      );
      expect(elasticsearchService.update).toHaveBeenCalled();
    });

    it('Unstaked Waiting Service Request Handler', async () => {
      const requestData = createMockRequest(RequestStatus.WaitingForUnstaked);

      const unstakedWaitingServiceRequestCommand: UnstakedWaitingServiceRequestCommandIndexer =
        new UnstakedWaitingServiceRequestCommandIndexer(
          requestData,
          mockBlockNumber(),
        );
      await unstakedWaitingServiceRequestHandler.execute(
        unstakedWaitingServiceRequestCommand,
      );
      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });
});
