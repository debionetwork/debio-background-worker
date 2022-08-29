import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import {
  addGeneticData,
  createGeneticAnalysisOrder,
  createGeneticAnalystService,
  GeneticAnalysis,
  GeneticAnalysisOrder,
  GeneticAnalysisStatus,
  GeneticAnalyst,
  GeneticAnalystService,
  GeneticData,
  processGeneticAnalysis,
  queryGeneticAnalysisByGeneticAnalysisTrackingId,
  queryGeneticAnalysisOrderByCustomerId,
  queryGeneticAnalysisOrderById,
  queryGeneticAnalystByAccountId,
  queryGeneticAnalystServicesByHashId,
  queryGeneticDataByOwnerId,
  rejectGeneticAnalysis,
  setGeneticAnalysisOrderPaid,
  submitGeneticAnalysis,
} from '@debionetwork/polkadot-provider';
import { INestApplication } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiPromise } from '@polkadot/api';
import { initializeApi } from '../../../e2e/polkadot-init';
import { CommonModule, ProcessEnvModule } from '../../../../src/common';
import { IndexerHandler } from '../../../../src/indexer/indexer.handler';
import { IndexerModule } from '../../../../src/indexer/indexer.module';
import { geneticAnalystServiceDataMock } from '../../../mock/models/genetic-analysts/genetic-analyst-service.mock';
import { SecretKeyList } from '../../../../src/common/secrets';

describe('Genetic Analysis Events', () => {
  let app: INestApplication;
  let api: ApiPromise;
  let pair: any;
  let geneticAnalysis: GeneticAnalysis;
  let geneticAnalysisOrder: GeneticAnalysisOrder;
  let geneticData: GeneticData;
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
        GCloudSecretManagerModule.withConfig(process.env.PARENT, SecretKeyList),
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

  it('initialize genetic analyst', async () => {
    const { info: infoGAService } = geneticAnalystServiceDataMock;

    const registerGaPromise: Promise<GeneticAnalyst> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
          resolve(res);
        });
      },
    );

    // eslint-disable-next-line
    const ga = (await registerGaPromise).normalize();

    const createServiceGeneticAnalystPromise: Promise<GeneticAnalystService> =
      // eslint-disable-next-line
      new Promise((resolve, reject) => {
        createGeneticAnalystService(api, pair, infoGAService, () => {
          queryGeneticAnalystByAccountId(api, pair.address).then((ga) => {
            queryGeneticAnalystServicesByHashId(api, ga.services.at(-1)).then(
              (res) => {
                resolve(res);
              },
            );
          });
        });
      });

    const gaService = await createServiceGeneticAnalystPromise;

    expect(gaService.info).toEqual(
      expect.objectContaining({
        name: infoGAService.name,
        testResultSample: infoGAService.testResultSample,
        description: infoGAService.description,
      }),
    );

    const geneticDataPromise: Promise<GeneticData> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        addGeneticData(api, pair, 'string', 'string', 'string', () => {
          queryGeneticDataByOwnerId(api, pair.address).then((res) => {
            resolve(res.at(-1));
          });
        });
      },
    );

    geneticData = await geneticDataPromise;
    expect(geneticData).toEqual(
      expect.objectContaining({
        title: 'string',
        description: 'string',
        reportLink: 'string',
      }),
    );

    const geneticAnalysisOrderPromise: Promise<GeneticAnalysisOrder> =
      // eslint-disable-next-line
      new Promise((resolve, reject) => {
        createGeneticAnalysisOrder(
          api,
          pair,
          geneticData.id,
          gaService.id,
          0,
          geneticData.reportLink,
          '0x8d2f0702072c07d31251be881104acde7953ecc1c8b33c31fce59ec6b0799ecc',
          () => {
            queryGeneticAnalysisOrderByCustomerId(api, pair.address).then(
              (gaOrder) => {
                setGeneticAnalysisOrderPaid(
                  api,
                  pair,
                  gaOrder.at(-1).id,
                  () => {
                    queryGeneticAnalysisOrderById(api, gaOrder.at(-1).id).then(
                      (res) => {
                        resolve(res);
                      },
                    );
                  },
                );
              },
            );
          },
        );
      });

    geneticAnalysisOrder = await geneticAnalysisOrderPromise;
    expect(geneticAnalysisOrder.serviceId).toEqual(gaService.id);
    expect(geneticAnalysisOrder.customerId).toEqual(pair.address);
    expect(geneticAnalysisOrder.sellerId).toEqual(pair.address);

    const geneticAnalysisPromise: Promise<GeneticAnalysis> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        submitGeneticAnalysis(
          api,
          pair,
          geneticAnalysisOrder.geneticAnalysisTrackingId,
          geneticData.reportLink,
          'string',
          () => {
            queryGeneticAnalysisByGeneticAnalysisTrackingId(
              api,
              geneticAnalysisOrder.geneticAnalysisTrackingId,
            ).then((res) => {
              resolve(res);
            });
          },
        );
      },
    );

    geneticAnalysis = await geneticAnalysisPromise;

    expect(geneticAnalysis.comment).toEqual('string');
    expect(geneticAnalysis.reportLink).toEqual(geneticData.reportLink);
    expect(geneticAnalysis.geneticAnalysisOrderId).toEqual(
      geneticAnalysisOrder.id,
    );
    expect(geneticAnalysis.geneticAnalysisTrackingId).toEqual(
      geneticAnalysisOrder.geneticAnalysisTrackingId,
    );

    const esGeneticAnalysis = await elasticsearchService.search({
      index: 'genetic-analysis',
      body: {
        query: {
          match: {
            _id: {
              query: geneticAnalysis.geneticAnalystId,
            },
          },
        },
      },
    });

    expect(esGeneticAnalysis.body.hits.hits.length).toEqual(1);

    const geneticAnalysisSource = esGeneticAnalysis.body.hits.hits[0]._source;

    expect(geneticAnalysisSource['genetic_analysis_tracking_id']).toEqual(
      geneticAnalysisOrder.geneticAnalysisTrackingId,
    );
    expect(geneticAnalysisSource['owner_id']).toEqual(pair.address);
    expect(geneticAnalysisSource['report_link']).toEqual(
      geneticData.reportLink,
    );
    expect(geneticAnalysisSource['status']).toEqual(
      GeneticAnalysisStatus.Registered,
    );
  }, 180000);

  it('should result ready genetic analysis', async () => {
    const geneticAnalysisInProgressPromise: Promise<GeneticAnalysis> =
      // eslint-disable-next-line
      new Promise((resolve, reject) => {
        processGeneticAnalysis(
          api,
          pair,
          geneticAnalysisOrder.geneticAnalysisTrackingId,
          GeneticAnalysisStatus.ResultReady,
          () => {
            queryGeneticAnalysisByGeneticAnalysisTrackingId(
              api,
              geneticAnalysisOrder.geneticAnalysisTrackingId,
            ).then((res) => {
              resolve(res);
            });
          },
        );
      });

    geneticAnalysis = await geneticAnalysisInProgressPromise;

    expect(geneticAnalysis.comment).toEqual('string');
    expect(geneticAnalysis.reportLink).toEqual(geneticData.reportLink);
    expect(geneticAnalysis.geneticAnalysisOrderId).toEqual(
      geneticAnalysisOrder.id,
    );
    expect(geneticAnalysis.geneticAnalysisTrackingId).toEqual(
      geneticAnalysisOrder.geneticAnalysisTrackingId,
    );
    expect(geneticAnalysis.status).toEqual(GeneticAnalysisStatus.ResultReady);

    const esGeneticAnalysis = await elasticsearchService.search({
      index: 'genetic-analysis',
      body: {
        query: {
          match: {
            _id: {
              query: geneticAnalysis.geneticAnalystId,
            },
          },
        },
      },
    });

    expect(esGeneticAnalysis.body.hits.hits.length).toEqual(1);

    const geneticAnalysisSource = esGeneticAnalysis.body.hits.hits[0]._source;

    expect(geneticAnalysisSource['genetic_analysis_tracking_id']).toEqual(
      geneticAnalysisOrder.geneticAnalysisTrackingId,
    );
    expect(geneticAnalysisSource['owner_id']).toEqual(pair.address);
    expect(geneticAnalysisSource['report_link']).toEqual(
      geneticData.reportLink,
    );
    expect(geneticAnalysisSource['status']).toEqual(
      GeneticAnalysisStatus.ResultReady,
    );
  }, 80000);

  it('should reject genetic analysis', async () => {
    const geneticAnalysisInProgressPromise: Promise<GeneticAnalysis> =
      // eslint-disable-next-line
      new Promise((resolve, reject) => {
        rejectGeneticAnalysis(
          api,
          pair,
          geneticAnalysisOrder.geneticAnalysisTrackingId,
          'string',
          'string',
          () => {
            queryGeneticAnalysisByGeneticAnalysisTrackingId(
              api,
              geneticAnalysisOrder.geneticAnalysisTrackingId,
            ).then((res) => {
              resolve(res);
            });
          },
        );
      });

    geneticAnalysis = await geneticAnalysisInProgressPromise;

    expect(geneticAnalysis.comment).toEqual('string');
    expect(geneticAnalysis.reportLink).toEqual(geneticData.reportLink);
    expect(geneticAnalysis.geneticAnalysisOrderId).toEqual(
      geneticAnalysisOrder.id,
    );
    expect(geneticAnalysis.geneticAnalysisTrackingId).toEqual(
      geneticAnalysisOrder.geneticAnalysisTrackingId,
    );
    expect(geneticAnalysis.rejectedTitle).toEqual('string');
    expect(geneticAnalysis.rejectedDescription).toEqual('string');
    expect(geneticAnalysis.status).toEqual(GeneticAnalysisStatus.Rejected);

    const esGeneticAnalysis = await elasticsearchService.search({
      index: 'genetic-analysis',
      body: {
        query: {
          match: {
            _id: {
              query: geneticAnalysis.geneticAnalystId,
            },
          },
        },
      },
    });

    expect(esGeneticAnalysis.body.hits.hits.length).toEqual(1);

    const geneticAnalysisSource = esGeneticAnalysis.body.hits.hits[0]._source;

    expect(geneticAnalysisSource['genetic_analysis_tracking_id']).toEqual(
      geneticAnalysisOrder.geneticAnalysisTrackingId,
    );
    expect(geneticAnalysisSource['owner_id']).toEqual(pair.address);
    expect(geneticAnalysisSource['report_link']).toEqual(
      geneticData.reportLink,
    );
    expect(geneticAnalysisSource['rejected_title']).toEqual('string');
    expect(geneticAnalysisSource['rejected_description']).toEqual('string');
    expect(geneticAnalysisSource['status']).toEqual(
      GeneticAnalysisStatus.Rejected,
    );
  }, 80000);
});
