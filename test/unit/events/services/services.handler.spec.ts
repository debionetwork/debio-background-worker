import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ServiceCommandHandlers,
  ServiceCreatedCommand,
  ServiceDeletedCommand,
  ServiceUpdatedCommand,
} from '../../../../src/indexer/events/services';
import { BlockMetaData } from '../../../../src/indexer/models/blockMetaData';
import { ServiceFlow } from '../../../../src/indexer/models/service-flow';
import { ServiceCreatedHandler } from '../../../../src/indexer/events/services/commands/service-created/service-created.handler';
import { ServiceDeletedHandler } from '../../../../src/indexer/events/services/commands/service-deleted/service-deleted.handler';
import { ServiceUpdatedHandler } from '../../../../src/indexer/events/services/commands/service-updated/service-updated.handler';
import {
  createObjectSearchLab,
  ElasticSearchServiceProvider,
} from '../../mock';
import { when } from 'jest-when';

let serviceCreatedHandler: ServiceCreatedHandler;
let serviceDeletedHandler: ServiceDeletedHandler;
let serviceUpdatedHandler: ServiceUpdatedHandler;

let elasticsearchService: ElasticsearchService;

describe('Services Substrate Event Handler', () => {
  function createMockService() {
    const first_price = {
      component: 'string',
      value: 1,
    };
    const second_price = {
      component: 'string',
      value: 1,
    };

    const prices_by_currency = {
      currency: 'XXX',
      totalPrice: 1,
      priceComponents: [first_price],
      additionalPrices: [second_price],
    };

    const service_info = {
      name: 'string',
      pricesByCurrency: [prices_by_currency],
      expected_duration: '',
      category: 'string',
      description: 'string',
      dnaCollectionProcess: '',
      testResultSample: '',
      longDescription: 'string',
      image: 'string',
    };

    return {
      toHuman: jest.fn(() => ({
        info: service_info,
        id: 'string',
        ownerId: 'string',
        serviceFlow: ServiceFlow.RequestTest,
      })),
    };
  }

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: '',
      blockNumber: 1,
    };
  }

  beforeAll(async () => {
    const modules: TestingModule = await Test.createTestingModule({
      providers: [ElasticSearchServiceProvider, ...ServiceCommandHandlers],
    }).compile();

    serviceCreatedHandler = modules.get<ServiceCreatedHandler>(
      ServiceCreatedHandler,
    );
    serviceDeletedHandler = modules.get<ServiceDeletedHandler>(
      ServiceDeletedHandler,
    );
    serviceUpdatedHandler = modules.get<ServiceUpdatedHandler>(
      ServiceUpdatedHandler,
    );

    elasticsearchService =
      modules.get<ElasticsearchService>(ElasticsearchService);

    await modules.init();
  });

  describe('Service Handler', () => {
    it('Service Created Handler', async () => {
      const service = createMockService();
      const LAB_ID = 'string';
      const CALLED_WITH = createObjectSearchLab(LAB_ID);
      const ES_RESULT = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  info: {
                    country: 'XX',
                    city: 'XX',
                    region: 'XX',
                  },
                },
              },
            ],
          },
        },
      };

      when(elasticsearchService.search)
        .calledWith(CALLED_WITH)
        .mockReturnValue(ES_RESULT);

      const serviceCreatedCommand: ServiceCreatedCommand =
        new ServiceCreatedCommand([service], mockBlockNumber());
      await serviceCreatedHandler.execute(serviceCreatedCommand);
      expect(elasticsearchService.search).toHaveBeenCalled();
      expect(elasticsearchService.index).toHaveBeenCalled();
      expect(elasticsearchService.update).toHaveBeenCalled();
    });

    it('Service Deleted Handler', async () => {
      const service = createMockService();
      const LAB_ID = 'string';
      const CALLED_WITH = createObjectSearchLab(LAB_ID);
      const ES_RESULT = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  services: [],
                },
              },
            ],
          },
        },
      };

      when(elasticsearchService.search)
        .calledWith(CALLED_WITH)
        .mockReturnValue(ES_RESULT);

      const serviceDeletedCommand: ServiceDeletedCommand =
        new ServiceDeletedCommand([service], mockBlockNumber());
      await serviceDeletedHandler.execute(serviceDeletedCommand);
      expect(elasticsearchService.search).toHaveBeenCalled();
      expect(elasticsearchService.delete).toHaveBeenCalled();
      expect(elasticsearchService.update).toHaveBeenCalled();
    });

    it('Service Updated Handler', async () => {
      const service = createMockService();
      const LAB_ID = 'string';
      const CALLED_WITH = createObjectSearchLab(LAB_ID);
      const ES_RESULT = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  services: [],
                  info: {
                    country: 'XX',
                    city: 'XX',
                    region: 'XX',
                  },
                },
              },
            ],
          },
        },
      };

      when(elasticsearchService.search)
        .calledWith(CALLED_WITH)
        .mockReturnValue(ES_RESULT);

      const serviceUpdatedCommand: ServiceUpdatedCommand =
        new ServiceUpdatedCommand([service], mockBlockNumber());
      await serviceUpdatedHandler.execute(serviceUpdatedCommand);
      expect(elasticsearchService.search).toHaveBeenCalled();
      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });
});
