import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import {
  createQualification,
  deleteQualification,
  GeneticAnalyst,
  GeneticAnalystQualification,
  queryGeneticAnalystByAccountId,
  queryGeneticAnalystQualificationsByHashId,
  queryGeneticAnalystQualificationsCountByOwner,
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
import { geneticAnalystQualificationsDataMock } from 'test/mock/models/genetic-analysts/genetic-analyst-qualifications.mock';

describe('Genetic Analyst Qualification Events', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
  let ga: GeneticAnalyst;
  let gaQualification: GeneticAnalystQualification;
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
      providers: [IndexerHandler, ...GeneticAnalystsCommandHandlers],
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

  it('should create genetic analyst qualification', async () => {
    ga = await queryGeneticAnalystByAccountId(api, pair.address);
    const { info } = geneticAnalystQualificationsDataMock;

    // eslint-disable-next-line
    const createGeneticAnalystQualificationPromise: Promise<GeneticAnalystQualification> =
      new Promise((resolve, reject) => {
        createQualification(api, pair, info, () => {
          queryGeneticAnalystQualificationsByHashId(
            api,
            ga.qualifications.at(-1),
          ).then((res) => {
            resolve(res);
          });
        });
      });

    gaQualification = await createGeneticAnalystQualificationPromise;

    expect(gaQualification.info.certification).toEqual(info.certification);
    expect(gaQualification.info.experience).toEqual(info.experience);

    const esGaQualification = await elasticsearchService.search({
      index: 'genetic-analysts-qualification',
      body: {
        query: {
          match: {
            _id: {
              query: gaQualification.id,
            },
          },
        },
      },
    });

    expect(esGaQualification.body.hits.hits.length).toEqual(1);

    const geneticAnalystQualificationSource =
      esGaQualification.body.hits.hits[0]._source;

    expect(geneticAnalystQualificationSource['info']['experience']).toEqual(
      info.experience,
    );
    expect(geneticAnalystQualificationSource['info']['certification']).toEqual(
      info.certification,
    );
  });

  it('should update genetic analyst qualification', async () => {
    ga = await queryGeneticAnalystByAccountId(api, pair.address);
    const { info } = geneticAnalystQualificationsDataMock;

    const UPDATE_EXPERIENCE = [
      {
        title: 'string2',
      },
    ];

    // eslint-disable-next-line
    const createGeneticAnalystQualificationPromise: Promise<GeneticAnalystQualification> =
      new Promise((resolve, reject) => {
        createQualification(
          api,
          pair,
          { ...info, experience: UPDATE_EXPERIENCE },
          () => {
            queryGeneticAnalystQualificationsByHashId(
              api,
              ga.qualifications.at(-1),
            ).then((res) => {
              resolve(res);
            });
          },
        );
      });

    gaQualification = await createGeneticAnalystQualificationPromise;

    expect(gaQualification.info.certification).toEqual(info.certification);
    expect(gaQualification.info.experience).toEqual(UPDATE_EXPERIENCE);

    const esGaQualification = await elasticsearchService.search({
      index: 'genetic-analysts-qualification',
      body: {
        query: {
          match: {
            _id: {
              query: gaQualification.id,
            },
          },
        },
      },
    });

    expect(esGaQualification.body.hits.hits.length).toEqual(1);

    const geneticAnalystQualificationSource =
      esGaQualification.body.hits.hits[0]._source;

    expect(geneticAnalystQualificationSource['info']['experience']).toEqual(
      UPDATE_EXPERIENCE,
    );
    expect(geneticAnalystQualificationSource['info']['certification']).toEqual(
      info.certification,
    );
  });

  it('should delete genetic analyst qualifications', async () => {
    // eslint-disable-next-line
    const deleteGeneticAnalystQualificationPromise: Promise<number> =
      new Promise((resolve, reject) => {
        deleteQualification(api, pair, gaQualification.id, () => {
          queryGeneticAnalystQualificationsCountByOwner(api, pair.address).then(
            (res) => {
              resolve(res);
            },
          );
        });
      });

    expect(await deleteGeneticAnalystQualificationPromise).toEqual(0);

    const esGeneticAnalystQualification = await elasticsearchService.count({
      index: 'genetic-analysts-qualification',
      body: {
        query: {
          match: {
            _id: {
              query: gaQualification.id,
            },
          },
        },
      },
    });

    expect(esGeneticAnalystQualification.body.count).toEqual(0);
  });
});
