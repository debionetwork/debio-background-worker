import {
  deleteGeneticAnalystService,
  deregisterGeneticAnalyst,
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
  queryGeneticAnalystServicesCountByOwner,
  queryGeneticDataByOwnerId,
  setGeneticAnalysisOrderFulfilled,
  setGeneticAnalysisOrderPaid,
  submitGeneticAnalysis,
} from '@debionetwork/polkadot-provider';
import { INestApplication } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiPromise } from '@polkadot/api';
import {
  DateTimeModule,
  EscrowService,
  NotificationModule,
  ProcessEnvModule,
  SubstrateModule,
  TransactionLoggingModule,
} from '../../../../../../src/common';
import { TransactionRequest } from '../../../../../../src/common/transaction-logging/models/transaction-request.entity';
import { SubstrateListenerHandler } from '../../../../../../src/listeners/substrate-listener/substrate-listener.handler';
import { dummyCredentials } from '../../../../config';
import { initializeApi } from '../../../../polkadot-init';
import { LabRating } from '../../../../../mock/models/rating/rating.entity';
import { escrowServiceMockFactory } from '../../../../../unit/mock';
import { geneticAnalystsDataMock } from '../../../../../mock/models/genetic-analysts/genetic-analysts.mock';
import { geneticAnalystServiceDataMock } from '../../../../../mock/models/genetic-analysts/genetic-analyst-service.mock';
import { createConnection } from 'typeorm';
import { Notification } from '../../../../../../src/common/notification/models/notification.entity';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { GeneticAnalysisOrderFulfilledHandler } from '../../../../../../src/listeners/substrate-listener/commands/genetic-analysis-order/genetic-analysis-order-fulfilled/genetic-analysis-order-fulfilled.handler';

describe('Genetic Analysis Order Fulfilled Integration Test', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;

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
        GCloudSecretManagerModule.withConfig(process.env.GCS_PARENT),
        TypeOrmModule.forRoot({
          type: 'postgres',
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [LabRating, TransactionRequest],
          autoLoadEntities: true,
        }),
        ProcessEnvModule,
        TransactionLoggingModule,
        SubstrateModule,
        CqrsModule,
        DateTimeModule,
        NotificationModule,
      ],
      providers: [
        {
          provide: EscrowService,
          useFactory: escrowServiceMockFactory,
        },
        SubstrateListenerHandler,
        GeneticAnalysisOrderFulfilledHandler,
      ],
    })
      .overrideProvider(GCloudSecretManagerService)
      .useClass(GoogleSecretManagerServiceMock)
      .compile();

    app = module.createNestApplication();
    await app.init();

    const { api: _api, pair: _pair } = await initializeApi();
    api = _api;
    pair = _pair;
  }, 36000);

  afterAll(async () => {
    await api.disconnect();
    await app.close();
  });

  it('genetic analysis order fulfilled event', async () => {
    let ga: GeneticAnalyst;
    let geneticAnalysisOrder: GeneticAnalysisOrder;
    let geneticAnalysis: GeneticAnalysis;

    const gaPromise: Promise<GeneticAnalyst> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
          resolve(res);
        });
      },
    );

    ga = await gaPromise;
    ga = ga.normalize();
    expect(ga.info).toEqual(geneticAnalystsDataMock.info);

    const gaServicePromise: Promise<GeneticAnalystService> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        queryGeneticAnalystServicesByHashId(api, ga.services[0]).then((res) => {
          resolve(res);
        });
      },
    );

    const gaService: GeneticAnalystService = await gaServicePromise;
    expect(gaService.info).toEqual(
      expect.objectContaining({
        name: geneticAnalystServiceDataMock.info.name,
        testResultSample: geneticAnalystServiceDataMock.info.testResultSample,
        description: geneticAnalystServiceDataMock.info.description,
      }),
    );

    const geneticDataPromise: Promise<GeneticData> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        queryGeneticDataByOwnerId(api, pair.address).then((res) => {
          resolve(res.at(-1));
        });
      },
    );

    const geneticData: GeneticData = await geneticDataPromise;
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
        queryGeneticAnalysisOrderByCustomerId(api, pair.address).then((res) => {
          resolve(res.at(-1));
        });
      });

    geneticAnalysisOrder = await geneticAnalysisOrderPromise;
    expect(geneticAnalysisOrder.serviceId).toEqual(gaService.id);
    expect(geneticAnalysisOrder.customerId).toEqual(pair.address);
    expect(geneticAnalysisOrder.sellerId).toEqual(pair.address);

    const geneticAnalysisOrderPaidPromise: Promise<GeneticAnalysisOrder> =
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

    geneticAnalysisOrder = await geneticAnalysisOrderPaidPromise;
    expect(geneticAnalysisOrder.serviceId).toEqual(gaService.id);
    expect(geneticAnalysisOrder.customerId).toEqual(pair.address);
    expect(geneticAnalysisOrder.sellerId).toEqual(pair.address);
    expect(geneticAnalysisOrder.status).toEqual(
      GeneticAnalysisOrderStatus.Paid,
    );

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

    geneticAnalysis = await processGeneticAnalysisPromise;
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

    const dbConnection = await createConnection({
      ...dummyCredentials,
      database: 'db_postgres',
      entities: [Notification],
      synchronize: true,
    });

    const notifications = await dbConnection
      .getRepository(Notification)
      .createQueryBuilder('notification')
      .where(
        'notification.to = :to AND notification.entity = :entity AND notification.role = :role',
        {
          to: geneticAnalysisOrder.sellerId,
          entity: 'Order Fulfilled',
          role: 'GA',
        },
      )
      .getMany();

    expect(notifications.length).toEqual(1);
    expect(notifications[0].to).toEqual(geneticAnalysisOrder.sellerId);
    expect(notifications[0].entity).toEqual('Order Fulfilled');
    expect(
      notifications[0].description.includes(
        `You've received ${+geneticAnalysisOrder.prices[0]
          .value} DBIO for completing the requested analysis for ${
          geneticAnalysisOrder.id
        }.`,
      ),
    ).toBeTruthy();

    // eslint-disable-next-line
    const deleteGa: Promise<number> = new Promise((resolve, reject) => {
      queryGeneticAnalystByAccountId(api, pair.address).then((ga) => {
        deleteGeneticAnalystService(api, pair, ga.services[0], () => {
          queryGeneticAnalystServicesCountByOwner(api, pair.address).then(
            (res) => {
              deregisterGeneticAnalyst(api, pair, () => {
                resolve(res);
              });
            },
          );
        });
      });
    });

    expect(await deleteGa).toEqual(0);
  }, 180000);
});
