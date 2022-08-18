import { ApiPromise } from '@polkadot/api';
import 'regenerator-runtime/runtime';
import { TestingModule } from '@nestjs/testing/testing-module';
import { Test } from '@nestjs/testing/test';
import { INestApplication } from '@nestjs/common/interfaces/nest-application.interface';
import { initializeApi } from '../../../../polkadot-init';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { LabRating } from '../../../../../mock/models/rating/rating.entity';
import { TransactionRequest } from '../../../../../../src/common/transaction-logging/models/transaction-request.entity';
import { LocationEntities } from '../../../../../../src/common/location/models';
import { dummyCredentials } from '../../../../config';
import { EscrowService } from '../../../../../../src/common/escrow/escrow.service';
import { escrowServiceMockFactory } from '../../../../../unit/mock';
import {
  DateTimeModule,
  NotificationModule,
  ProcessEnvModule,
  SubstrateModule,
} from '../../../../../../src/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SubstrateListenerHandler } from '../../../../../../src/listeners/substrate-listener/substrate-listener.handler';
import {
  GeneticAnalysis,
  GeneticAnalysisOrder,
  GeneticAnalysisOrderStatus,
  GeneticAnalyst,
  GeneticAnalystService,
  GeneticData,
} from '@debionetwork/polkadot-provider/lib/models/genetic-analysts';
import {
  addGeneticData,
  createGeneticAnalysisOrder,
  createGeneticAnalystService,
  deleteGeneticAnalystService,
  deregisterGeneticAnalyst,
  queryGeneticAnalysisByGeneticAnalysisTrackingId,
  queryGeneticAnalysisOrderByCustomerId,
  queryGeneticAnalysisOrderById,
  queryGeneticAnalystByAccountId,
  queryGeneticAnalystServicesByHashId,
  queryGeneticAnalystServicesCountByOwner,
  queryGeneticDataByOwnerId,
  registerGeneticAnalyst,
  rejectGeneticAnalysis,
  setGeneticAnalysisOrderPaid,
  stakeGeneticAnalyst,
  updateGeneticAnalystVerificationStatus,
} from '@debionetwork/polkadot-provider';
import { geneticAnalystsDataMock } from '../../../../../mock/models/genetic-analysts/genetic-analysts.mock';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';
import { geneticAnalystServiceDataMock } from '../../../../../mock/models/genetic-analysts/genetic-analyst-service.mock';
import { Notification } from '../../../../../../src/common/notification/models/notification.entity';
import { createConnection } from 'typeorm';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { GeneticAnalysisRejectedHandler } from '../../../../../../src/listeners/substrate-listener/commands/genetic-analysis/genetic-analysis-rejected/genetic-analysis-rejected.handler';

describe('Genetic Analysis Order Created Integration Test', () => {
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
        TypeOrmModule.forRoot({
          name: 'dbLocation',
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [...LocationEntities],
          autoLoadEntities: true,
        }),
        ProcessEnvModule,
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
        GeneticAnalysisRejectedHandler,
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
  }, 360000);

  afterAll(async () => {
    await api.disconnect();
    await app.close();
    api = null;
    pair = null;
  });

  it('genetic analysis rejected event', async () => {
    let ga: GeneticAnalyst;
    let geneticAnalysisOrder: GeneticAnalysisOrder;

    const gaPromise: Promise<GeneticAnalyst> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        registerGeneticAnalyst(api, pair, geneticAnalystsDataMock.info, () => {
          stakeGeneticAnalyst(api, pair, () => {
            updateGeneticAnalystVerificationStatus(
              api,
              pair,
              pair.address,
              VerificationStatus.Verified,
              () => {
                queryGeneticAnalystByAccountId(api, pair.address).then(
                  (res) => {
                    resolve(res);
                  },
                );
              },
            );
          });
        });
      },
    );

    ga = await gaPromise;
    ga = ga.normalize();
    expect(ga.info).toEqual(geneticAnalystsDataMock.info);

    const gaServicePromise: Promise<GeneticAnalystService> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        createGeneticAnalystService(
          api,
          pair,
          geneticAnalystServiceDataMock.info,
          () => {
            queryGeneticAnalystByAccountId(api, pair.address).then((ga) => {
              queryGeneticAnalystServicesByHashId(api, ga.services[0]).then(
                (res) => {
                  resolve(res);
                },
              );
            });
          },
        );
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
        addGeneticData(api, pair, 'string', 'string', 'string', () => {
          queryGeneticDataByOwnerId(api, pair.address).then((res) => {
            resolve(res.at(-1));
          });
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

    const geneticAnalysisRejectedPromise: Promise<GeneticAnalysis> =
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

    const geneticAnalysis: GeneticAnalysis =
      await geneticAnalysisRejectedPromise;

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
          to: geneticAnalysis.ownerId,
          entity: 'Order Rejected',
          role: 'Customer',
        },
      )
      .getMany();

    expect(notifications.length).toEqual(1);
    expect(notifications[0].to).toEqual(geneticAnalysis.ownerId);
    expect(notifications[0].entity).toEqual('Order Rejected');
    expect(
      notifications[0].description.includes(
        `Your sample from [] has been rejected. Click here to see your order details.`,
      ),
    ).toBeTruthy();
    expect(notifications[0].reference_id).toEqual(
      geneticAnalysis.geneticAnalysisOrderId,
    );

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

    await dbConnection.destroy();
  }, 240000);
});
