import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import {
  createGeneticAnalystService,
  deleteGeneticAnalystService,
  GeneticAnalyst,
  GeneticAnalystService,
  queryGeneticAnalystByAccountId,
  queryGeneticAnalystServicesByHashId,
  queryGeneticAnalystServicesCountByOwner,
  queryGetAllGeneticAnalystServices,
  registerGeneticAnalyst,
  updateGeneticAnalystService,
} from '@debionetwork/polkadot-provider';
import { INestApplication } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiPromise } from '@polkadot/api';
import { initializeApi } from '../../polkadot-init';
import { CommonModule, ProcessEnvModule } from '../../../../src/common';
import { GeneticAnalystsCommandHandlers } from '../../../../src/indexer/events/genetic-analysts';
import { IndexerHandler } from '../../../../src/indexer/indexer.handler';
import { IndexerModule } from '../../../../src/indexer/indexer.module';
import { geneticAnalystsDataMock } from '../../../mock/models/genetic-analysts/genetic-analysts.mock';
import { geneticAnalystServiceDataMock } from '../../../mock/models/genetic-analysts/genetic-analyst-service.mock';

describe('Genetic Analyst Service Events', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
  let ga: GeneticAnalyst;
  let gaService: GeneticAnalystService;
  let elasticsearchService: ElasticsearchService;

  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['ELASTICSEARCH_NODE', process.env.ELASTICSEARCH_NODE],
      ['ELASTICSEARCH_USERNAME', process.env.ELASTICSEARCH_USERNAME],
      ['ELASTICSEARCH_PASSWORD', process.env.ELASTICSEARCH_PASSWORD],
      ['SUBSTRATE_URL', process.env.SUBSTRATE_URL],
      ['ADMIN_SUBSTRATE_MNEMONIC', process.env.ADMIN_SUBSTRATE_MNEMONIC],
      ['EMAIL', process.env.EMAIL],
      ['PASS_EMAIL', process.env.PASS_EMAIL],
    ]);

    loadSecrets() {
      return null;
    }

    getSecret(key) {
      return this._secretsList.get(key);
    }
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        GCloudSecretManagerModule.withConfig(process.env.PARENT),
        CommonModule,
        ProcessEnvModule,
        CqrsModule,
        ScheduleModule.forRoot(),
        IndexerModule,
      ],
      providers: [IndexerHandler],
    })
      .overrideProvider(GCloudSecretManagerService)
      .useClass(GoogleSecretManagerServiceMock)
      .compile();

    elasticsearchService =
      module.get<ElasticsearchService>(ElasticsearchService);
    app = module.createNestApplication();
    await app.init();

    const { api: _api, pair: _pair } = await initializeApi();
    api = _api;
    pair = _pair;
  }, 450000);

  afterAll(async () => {
    await api.disconnect();
    await elasticsearchService.close();
    await app.close();
  }, 12000);

  it('register genetic analyst', async () => {
    const { info } = geneticAnalystsDataMock;
    const registerGeneticAnalystPromise: Promise<GeneticAnalyst> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        registerGeneticAnalyst(api, pair, info, () => {
          queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
            resolve(res);
          });
        });
      },
    );

    ga = (await registerGeneticAnalystPromise).normalize();

    expect(ga.info).toEqual(info);

    const esGeneticAnalyst = await elasticsearchService.search({
      index: 'genetic-analysts',
      body: {
        query: {
          match: {
            _id: {
              query: ga.accountId,
            },
          },
        },
      },
    });

    expect(esGeneticAnalyst.body.hits.hits.length).toEqual(1);

    const geneticAnalystSource = esGeneticAnalyst.body.hits.hits[0]._source;

    expect(geneticAnalystSource['info']['first_name']).toEqual(
      ga.info.firstName,
    );
    expect(geneticAnalystSource['info']['last_name']).toEqual(ga.info.lastName);
    expect(geneticAnalystSource['info']['gender']).toEqual(ga.info.gender);
    expect(Number(geneticAnalystSource['info']['date_of_birth'])).toEqual(
      ga.info.dateOfBirth,
    );
    expect(geneticAnalystSource['info']['email']).toEqual(ga.info.email);
    expect(geneticAnalystSource['info']['phone_number']).toEqual(
      ga.info.phoneNumber,
    );
    expect(geneticAnalystSource['info']['specialization']).toEqual(
      ga.info.specialization,
    );
    expect(geneticAnalystSource['info']['profile_link']).toEqual(
      ga.info.profileLink,
    );
    expect(geneticAnalystSource['info']['profile_image']).toEqual(
      ga.info.profileImage,
    );
  }, 120000);

  it('should create service for genetic analyst', async () => {
    const { info } = geneticAnalystServiceDataMock;

    const EXPECTED_PRICE_CURRENCY = [
      {
        currency: 'DAI',
        totalPrice: '1,000,000,000,000,000,000',
        priceComponents: [
          {
            component: 'string',
            value: '900,000,000,000,000,000',
          },
        ],
        additionalPrices: [
          {
            component: 'string',
            value: '100,000,000,000,000,000',
          },
        ],
      },
    ];

    const EXPECTED_PRICE_CURRENCY_ES = [
      {
        currency: 'DAI',
        total_price: '1,000,000,000,000,000,000',
        price_components: [
          {
            component: 'string',
            value: '900,000,000,000,000,000',
          },
        ],
        additional_prices: [
          {
            component: 'string',
            value: '100,000,000,000,000,000',
          },
        ],
      },
    ];

    const EXPECTED_DURATION_ES = {
      duration: '1',
      duration_type: 'WorkingDays',
    };

    const createGeneticAnalystServicePromise: Promise<GeneticAnalystService> =
      // eslint-disable-next-line
      new Promise((resolve, reject) => {
        createGeneticAnalystService(api, pair, info, () => {
          queryGetAllGeneticAnalystServices(api).then((service) => {
            resolve(service.at(-1));
          });
        });
      });

    gaService = await createGeneticAnalystServicePromise;

    expect(gaService.info.description).toEqual(info.description);
    expect(gaService.info.expectedDuration).toEqual(info.expectedDuration);
    expect(gaService.info.name).toEqual(info.name);
    expect(gaService.info.pricesByCurrency).toEqual(EXPECTED_PRICE_CURRENCY);

    const esGeneticAnalystService = await elasticsearchService.search({
      index: 'genetic-analysts-services',
      body: {
        query: {
          match: {
            _id: {
              query: gaService.id,
            },
          },
        },
      },
    });

    expect(esGeneticAnalystService.body.hits.hits.length).toEqual(1);

    const geneticAnalystServiceSource =
      esGeneticAnalystService.body.hits.hits[0]._source;

    expect(geneticAnalystServiceSource['info']['name']).toEqual(info.name);
    expect(geneticAnalystServiceSource['info']['description']).toEqual(
      info.name,
    );
    expect(geneticAnalystServiceSource['info']['prices_by_currency']).toEqual(
      EXPECTED_PRICE_CURRENCY_ES,
    );
    expect(geneticAnalystServiceSource['info']['expected_duration']).toEqual(
      EXPECTED_DURATION_ES,
    );
  }, 120000);

  it('should update service for genetic analyst', async () => {
    const { info } = geneticAnalystServiceDataMock;
    const UPDATE_NAME = 'string2';

    const EXPECTED_PRICE_CURRENCY = [
      {
        currency: 'DAI',
        totalPrice: '1,000,000,000,000,000,000',
        priceComponents: [
          {
            component: 'string',
            value: '900,000,000,000,000,000',
          },
        ],
        additionalPrices: [
          {
            component: 'string',
            value: '100,000,000,000,000,000',
          },
        ],
      },
    ];

    const EXPECTED_PRICE_CURRENCY_ES = [
      {
        currency: 'DAI',
        total_price: '1,000,000,000,000,000,000',
        price_components: [
          {
            component: 'string',
            value: '900,000,000,000,000,000',
          },
        ],
        additional_prices: [
          {
            component: 'string',
            value: '100,000,000,000,000,000',
          },
        ],
      },
    ];

    const EXPECTED_DURATION_ES = {
      duration: '1',
      duration_type: 'WorkingDays',
    };

    const updateGeneticAnalystServicePromise: Promise<GeneticAnalystService> =
      // eslint-disable-next-line
      new Promise((resolve, reject) => {
        updateGeneticAnalystService(
          api,
          pair,
          gaService.id,
          { ...info, name: UPDATE_NAME },
          () => {
            queryGeneticAnalystServicesByHashId(api, gaService.id).then(
              (service) => {
                resolve(service);
              },
            );
          },
        );
      });

    gaService = await updateGeneticAnalystServicePromise;

    expect(gaService.info.description).toEqual(info.description);
    expect(gaService.info.expectedDuration).toEqual(info.expectedDuration);
    expect(gaService.info.name).toEqual(UPDATE_NAME);
    expect(gaService.info.pricesByCurrency).toEqual(EXPECTED_PRICE_CURRENCY);

    const esGeneticAnalystService = await elasticsearchService.search({
      index: 'genetic-analysts-services',
      body: {
        query: {
          match: {
            _id: {
              query: gaService.id,
            },
          },
        },
      },
    });

    expect(esGeneticAnalystService.body.hits.hits.length).toEqual(1);

    const geneticAnalystServiceSource =
      esGeneticAnalystService.body.hits.hits[0]._source;

    expect(geneticAnalystServiceSource['info']['name']).toEqual(UPDATE_NAME);
    expect(geneticAnalystServiceSource['info']['description']).toEqual(
      info.name,
    );
    expect(geneticAnalystServiceSource['info']['prices_by_currency']).toEqual(
      EXPECTED_PRICE_CURRENCY_ES,
    );
    expect(geneticAnalystServiceSource['info']['expected_duration']).toEqual(
      EXPECTED_DURATION_ES,
    );
  }, 120000);

  it('should delete service for genetic analyst', async () => {
    const deleteGeneticAnalystServicePromise: Promise<number> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        deleteGeneticAnalystService(api, pair, gaService.id, () => {
          queryGeneticAnalystServicesCountByOwner(api, pair.address).then(
            (res) => {
              resolve(res);
            },
          );
        });
      },
    );

    expect(await deleteGeneticAnalystServicePromise).toEqual(0);

    const esGeneticAnalystService = await elasticsearchService.count({
      index: 'genetic-analysts-services',
      body: {
        query: {
          match: {
            _id: {
              query: gaService.id,
            },
          },
        },
      },
    });

    expect(esGeneticAnalystService.body.count).toEqual(0);
  }, 120000);
});
