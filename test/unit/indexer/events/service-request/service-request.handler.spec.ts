import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateServiceRequestHandler } from '../../../../../src/indexer/events/service-request/commands/create-service-request/create-service-request.handler';
import {
  CreateServiceRequestCommandIndexer,
  RequestServiceCommandHandlers,
} from '../../../../../src/indexer/events/service-request';
import { RequestStatus } from '../../../../../src/indexer/models/service-request/request-status';
import { BlockMetaData } from '../../../../../src/indexer/models/block-meta-data';
import {
  createObjectSearchCountryServiceRequest,
  ElasticSearchServiceProvider,
} from '../../../mock';
import { when } from 'jest-when';

let createServiceRequestHandler: CreateServiceRequestHandler;

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

    createServiceRequestHandler = modules.get<CreateServiceRequestHandler>(
      CreateServiceRequestHandler,
    );

    elasticsearchService =
      modules.get<ElasticsearchService>(ElasticsearchService);

    await modules.init();
  });

  describe('Service Request Handler', () => {
    it('Created service request handler defined', () => {
      expect(createServiceRequestHandler).toBeDefined();
    });
  });

  describe('Service Request Event', () => {
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

      const COUNTRY_ID = 'XX';
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
  });
});
