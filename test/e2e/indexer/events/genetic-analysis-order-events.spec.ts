import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import {
  addGeneticData,
  cancelGeneticAnalysisOrder,
  createGeneticAnalysisOrder,
  createGeneticAnalystService,
  GeneticAnalysis,
  GeneticAnalysisOrder,
  GeneticAnalysisOrderStatus,
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
  setGeneticAnalysisOrderFulfilled,
  setGeneticAnalysisOrderPaid,
  setGeneticAnalysisOrderRefunded,
  stakeGeneticAnalyst,
  submitGeneticAnalysis,
  updateGeneticAnalystVerificationStatus,
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
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';
import { SecretKeyList } from '../../../../src/common/secrets';

describe('Genetic Analysis Events', () => {
  let app: INestApplication;
  let api: ApiPromise;
  let pair: any;
  let ga: GeneticAnalyst;
  let gaService: GeneticAnalystService;
  let geneticData: GeneticData;
  let geneticAnalysisOrder: GeneticAnalysisOrder;
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
        stakeGeneticAnalyst(api, pair, () => {
          updateGeneticAnalystVerificationStatus(
            api,
            pair,
            pair.address,
            VerificationStatus.Verified,
            () => {
              queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
                resolve(res);
              });
            },
          );
        });
      },
    );

    // eslint-disable-next-line
    ga = (await registerGaPromise).normalize();

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

    gaService = await createServiceGeneticAnalystPromise;

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
  }, 120000);

  it('it should create genetic analysis order', async () => {
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
              (res) => {
                resolve(res.at(-1));
              },
            );
          },
        );
      });

    geneticAnalysisOrder = await geneticAnalysisOrderPromise;
    expect(geneticAnalysisOrder.serviceId).toEqual(gaService.id);
    expect(geneticAnalysisOrder.customerId).toEqual(pair.address);
    expect(geneticAnalysisOrder.sellerId).toEqual(pair.address);

    const esGeneticAnalysisOrder = await elasticsearchService.search({
      index: 'genetic-analysis-order',
      body: {
        query: {
          match: {
            _id: {
              query: geneticAnalysisOrder.id,
            },
          },
        },
      },
    });

    expect(esGeneticAnalysisOrder.body.hits.hits.length).toEqual(1);

    const geneticAnalysisOrderSource =
      esGeneticAnalysisOrder.body.hits.hits[0]._source;

    expect(geneticAnalysisOrderSource['service_id']).toEqual(gaService.id);
    expect(geneticAnalysisOrderSource['customer_id']).toEqual(pair.address);
    expect(geneticAnalysisOrderSource['seller_id']).toEqual(pair.address);
    expect(geneticAnalysisOrderSource['customer_box_public_key']).toEqual(
      '0x8d2f0702072c07d31251be881104acde7953ecc1c8b33c31fce59ec6b0799ecc',
    );
    expect(geneticAnalysisOrderSource['genetic_data_id']).toEqual(
      geneticData.id,
    );
    expect(geneticAnalysisOrderSource['status']).toEqual(
      GeneticAnalysisOrderStatus.Unpaid,
    );
  }, 50000);

  it('should set paid order', async () => {
    const paidGeneticAnalysisOrderPromise: Promise<GeneticAnalysisOrder> =
      // eslint-disable-next-line
      new Promise((resolve, reject) => {
        setGeneticAnalysisOrderPaid(api, pair, geneticAnalysisOrder.id, () => {
          queryGeneticAnalysisOrderById(api, geneticAnalysisOrder.id).then(
            (res) => {
              resolve(res);
            },
          );
        });
      });

    geneticAnalysisOrder = await paidGeneticAnalysisOrderPromise;

    expect(geneticAnalysisOrder.serviceId).toEqual(gaService.id);
    expect(geneticAnalysisOrder.customerId).toEqual(pair.address);
    expect(geneticAnalysisOrder.sellerId).toEqual(pair.address);
    expect(geneticAnalysisOrder.status).toEqual(
      GeneticAnalysisOrderStatus.Paid,
    );

    const esGeneticAnalysisOrder = await elasticsearchService.search({
      index: 'genetic-analysis-order',
      body: {
        query: {
          match: {
            _id: {
              query: geneticAnalysisOrder.id,
            },
          },
        },
      },
    });

    expect(esGeneticAnalysisOrder.body.hits.hits.length).toEqual(1);

    const geneticAnalysisOrderSource =
      esGeneticAnalysisOrder.body.hits.hits[0]._source;

    expect(geneticAnalysisOrderSource['service_id']).toEqual(gaService.id);
    expect(geneticAnalysisOrderSource['customer_id']).toEqual(pair.address);
    expect(geneticAnalysisOrderSource['seller_id']).toEqual(pair.address);
    expect(geneticAnalysisOrderSource['customer_box_public_key']).toEqual(
      '0x8d2f0702072c07d31251be881104acde7953ecc1c8b33c31fce59ec6b0799ecc',
    );
    expect(geneticAnalysisOrderSource['genetic_data_id']).toEqual(
      geneticData.id,
    );
    expect(geneticAnalysisOrderSource['status']).toEqual(
      GeneticAnalysisOrderStatus.Paid,
    );
  }, 50000);

  it('should make order fulfilled', async () => {
    const processGeneticAnalysisPromise: Promise<GeneticAnalysis> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        processGeneticAnalysis(
          api,
          pair,
          geneticAnalysisOrder.geneticAnalysisTrackingId,
          GeneticAnalysisStatus.InProgress,
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

    let geneticAnalysis = await processGeneticAnalysisPromise;
    expect(geneticAnalysis.status).toEqual(GeneticAnalysisStatus.InProgress);

    const submitGeneticAnalysisPromise: Promise<GeneticAnalysis> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        submitGeneticAnalysis(
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
      },
    );

    geneticAnalysis = await submitGeneticAnalysisPromise;
    expect(geneticAnalysis.reportLink).toEqual('string');
    expect(geneticAnalysis.comment).toEqual('string');

    const processGeneticAnalysisResultReadyPromise: Promise<GeneticAnalysis> =
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

    geneticAnalysis = await processGeneticAnalysisResultReadyPromise;
    expect(geneticAnalysis.status).toEqual(GeneticAnalysisStatus.ResultReady);

    const geneticAnalysisOrderFulfilledPromise: Promise<GeneticAnalysisOrder> =
      // eslint-disable-next-line
      new Promise((resolve, reject) => {
        setGeneticAnalysisOrderFulfilled(
          api,
          pair,
          geneticAnalysisOrder.id,
          () => {
            queryGeneticAnalysisOrderById(api, geneticAnalysisOrder.id).then(
              (res) => {
                resolve(res);
              },
            );
          },
        );
      });

    geneticAnalysisOrder = await geneticAnalysisOrderFulfilledPromise;
    geneticAnalysisOrder = geneticAnalysisOrder.normalize();
    expect(geneticAnalysisOrder.serviceId).toEqual(gaService.id);
    expect(geneticAnalysisOrder.customerId).toEqual(pair.address);
    expect(geneticAnalysisOrder.sellerId).toEqual(pair.address);
    expect(geneticAnalysisOrder.status).toEqual(
      GeneticAnalysisOrderStatus.Fulfilled,
    );

    const esGeneticAnalysisOrder = await elasticsearchService.search({
      index: 'genetic-analysis-order',
      body: {
        query: {
          match: {
            _id: {
              query: geneticAnalysisOrder.id,
            },
          },
        },
      },
    });

    expect(esGeneticAnalysisOrder.body.hits.hits.length).toEqual(1);

    const geneticAnalysisOrderSource =
      esGeneticAnalysisOrder.body.hits.hits[0]._source;

    expect(geneticAnalysisOrderSource['service_id']).toEqual(gaService.id);
    expect(geneticAnalysisOrderSource['customer_id']).toEqual(pair.address);
    expect(geneticAnalysisOrderSource['seller_id']).toEqual(pair.address);
    expect(geneticAnalysisOrderSource['customer_box_public_key']).toEqual(
      '0x8d2f0702072c07d31251be881104acde7953ecc1c8b33c31fce59ec6b0799ecc',
    );
    expect(geneticAnalysisOrderSource['genetic_data_id']).toEqual(
      geneticData.id,
    );
    expect(geneticAnalysisOrderSource['status']).toEqual(
      GeneticAnalysisOrderStatus.Fulfilled,
    );
  }, 180000);

  it('should canceled order', async () => {
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
                const idOrder = gaOrder.at(-1).id;
                cancelGeneticAnalysisOrder(api, pair, idOrder, () => {
                  queryGeneticAnalysisOrderById(api, idOrder).then((res) => {
                    resolve(res);
                  });
                });
              },
            );
          },
        );
      });

    geneticAnalysisOrder = await geneticAnalysisOrderPromise;
    expect(geneticAnalysisOrder.serviceId).toEqual(gaService.id);
    expect(geneticAnalysisOrder.customerId).toEqual(pair.address);
    expect(geneticAnalysisOrder.sellerId).toEqual(pair.address);
    expect(geneticAnalysisOrder.status).toEqual(
      GeneticAnalysisOrderStatus.Cancelled,
    );

    const esGeneticAnalysisOrder = await elasticsearchService.search({
      index: 'genetic-analysis-order',
      body: {
        query: {
          match: {
            _id: {
              query: geneticAnalysisOrder.id,
            },
          },
        },
      },
    });

    expect(esGeneticAnalysisOrder.body.hits.hits.length).toEqual(1);

    const geneticAnalysisOrderSource =
      esGeneticAnalysisOrder.body.hits.hits[0]._source;

    expect(geneticAnalysisOrderSource['service_id']).toEqual(gaService.id);
    expect(geneticAnalysisOrderSource['customer_id']).toEqual(pair.address);
    expect(geneticAnalysisOrderSource['seller_id']).toEqual(pair.address);
    expect(geneticAnalysisOrderSource['customer_box_public_key']).toEqual(
      '0x8d2f0702072c07d31251be881104acde7953ecc1c8b33c31fce59ec6b0799ecc',
    );
    expect(geneticAnalysisOrderSource['genetic_data_id']).toEqual(
      geneticData.id,
    );
    expect(geneticAnalysisOrderSource['status']).toEqual(
      GeneticAnalysisOrderStatus.Cancelled,
    );
  }, 120000);

  it('should refunded order', async () => {
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
                const order = gaOrder.at(-1);
                const idOrder = order.id;
                setGeneticAnalysisOrderPaid(api, pair, idOrder, () => {
                  submitGeneticAnalysis(
                    api,
                    pair,
                    order.geneticAnalysisTrackingId,
                    geneticData.reportLink,
                    'string',
                    () => {
                      queryGeneticAnalysisByGeneticAnalysisTrackingId(
                        api,
                        order.geneticAnalysisTrackingId,
                        // eslint-disable-next-line
                      ).then((geneticAnalysis) => {
                        rejectGeneticAnalysis(
                          api,
                          pair,
                          order.geneticAnalysisTrackingId,
                          'string',
                          'string',
                          () => {
                            setGeneticAnalysisOrderRefunded(
                              api,
                              pair,
                              order.id,
                              () => {
                                queryGeneticAnalysisOrderById(
                                  api,
                                  order.id,
                                ).then((res) => {
                                  resolve(res);
                                });
                              },
                            );
                          },
                        );
                      });
                    },
                  );
                });
              },
            );
          },
        );
      });

    geneticAnalysisOrder = await geneticAnalysisOrderPromise;
    expect(geneticAnalysisOrder.serviceId).toEqual(gaService.id);
    expect(geneticAnalysisOrder.customerId).toEqual(pair.address);
    expect(geneticAnalysisOrder.sellerId).toEqual(pair.address);
    expect(geneticAnalysisOrder.status).toEqual(
      GeneticAnalysisOrderStatus.Refunded,
    );

    const esGeneticAnalysisOrder = await elasticsearchService.search({
      index: 'genetic-analysis-order',
      body: {
        query: {
          match: {
            _id: {
              query: geneticAnalysisOrder.id,
            },
          },
        },
      },
    });

    expect(esGeneticAnalysisOrder.body.hits.hits.length).toEqual(1);

    const geneticAnalysisOrderSource =
      esGeneticAnalysisOrder.body.hits.hits[0]._source;

    expect(geneticAnalysisOrderSource['service_id']).toEqual(gaService.id);
    expect(geneticAnalysisOrderSource['customer_id']).toEqual(pair.address);
    expect(geneticAnalysisOrderSource['seller_id']).toEqual(pair.address);
    expect(geneticAnalysisOrderSource['customer_box_public_key']).toEqual(
      '0x8d2f0702072c07d31251be881104acde7953ecc1c8b33c31fce59ec6b0799ecc',
    );
    expect(geneticAnalysisOrderSource['genetic_data_id']).toEqual(
      geneticData.id,
    );
    expect(geneticAnalysisOrderSource['status']).toEqual(
      GeneticAnalysisOrderStatus.Refunded,
    );
  }, 180000);
});
