import {
  createQualification,
  deleteQualification,
  GeneticAnalystQualification,
  queryGeneticAnalystByAccountId,
  queryGeneticAnalystQualificationsByHashId,
  queryGeneticAnalystQualificationsCountByOwner,
  updateQualification,
} from '@debionetwork/polkadot-provider';
import { INestApplication } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiPromise } from '@polkadot/api';
import { initializeApi } from '../../polkadot-init';
import { CommonModule, ProcessEnvModule } from '@common/index';
import { IndexerHandler } from '@indexer/indexer.handler';
import { IndexerModule } from '@indexer/indexer.module';
import { geneticAnalystQualificationsDataMock } from '../../../mock/models/genetic-analysts/genetic-analyst-qualifications.mock';
import { SecretKeyList } from '@common/secrets';

describe('Genetic Analyst Qualification Events', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
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
        CommonModule,
        ProcessEnvModule,
        CqrsModule,
        ScheduleModule.forRoot(),
        IndexerModule,
      ],
      providers: [IndexerHandler],
    })
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
    const { info } = geneticAnalystQualificationsDataMock;

    const EXPECTED_QUALIFICATIONS_ES = [
      {
        title: 'string',
        issuer: 'string',
        month: 'string',
        year: 'string',
        description: 'string',
        supporting_document: 'string',
      },
    ];

    const createGeneticAnalystQualificationPromise: Promise<GeneticAnalystQualification> =
      // eslint-disable-next-line
      new Promise((resolve, reject) => {
        createQualification(api, pair, info, () => {
          queryGeneticAnalystByAccountId(api, pair.address).then((ga) => {
            queryGeneticAnalystQualificationsByHashId(
              api,
              ga.qualifications.at(-1),
            ).then((res) => {
              resolve(res);
            });
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
      EXPECTED_QUALIFICATIONS_ES,
    );
  }, 120000);

  it('should update genetic analyst qualification', async () => {
    const { info } = geneticAnalystQualificationsDataMock;

    const UPDATE_EXPERIENCE = [
      {
        title: 'string2',
      },
    ];

    const EXPECTED_QUALIFICATIONS_ES = [
      {
        title: 'string',
        issuer: 'string',
        month: 'string',
        year: 'string',
        description: 'string',
        supporting_document: 'string',
      },
    ];

    const updateGeneticAnalystQualificationPromise: Promise<GeneticAnalystQualification> =
      // eslint-disable-next-line
      new Promise((resolve, reject) => {
        updateQualification(
          api,
          pair,
          gaQualification.id,
          { ...info, experience: UPDATE_EXPERIENCE },
          () => {
            queryGeneticAnalystByAccountId(api, pair.address).then((ga) => {
              queryGeneticAnalystQualificationsByHashId(
                api,
                ga.qualifications.at(-1),
              ).then((res) => {
                resolve(res);
              });
            });
          },
        );
      });

    gaQualification = await updateGeneticAnalystQualificationPromise;

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
      EXPECTED_QUALIFICATIONS_ES,
    );
  }, 120000);

  it('should delete genetic analyst qualifications', async () => {
    const deleteGeneticAnalystQualificationPromise: Promise<number> =
      // eslint-disable-next-line
      new Promise((resolve, reject) => {
        deleteQualification(api, pair, gaQualification.id, () => {
          queryGeneticAnalystQualificationsCountByOwner(api, pair.address).then(
            (res) => {
              resolve(res);
            },
          );
        });
      });

    const count = await deleteGeneticAnalystQualificationPromise;

    expect(count).toEqual(0);

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
  }, 120000);
});
