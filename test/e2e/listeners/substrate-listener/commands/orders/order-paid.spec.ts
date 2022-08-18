import { ApiPromise } from '@polkadot/api';
import 'regenerator-runtime/runtime';
import {
  queryLastOrderHashByCustomer,
  queryOrderDetailByOrderID,
} from '@debionetwork/polkadot-provider/lib/query/labs/orders';
import {
  createOrder,
  setOrderPaid,
} from '@debionetwork/polkadot-provider/lib/command/labs/orders';
import {
  processDnaSample,
  submitTestResult,
} from '@debionetwork/polkadot-provider/lib/command/labs/genetic-testing';
import { deleteService } from '@debionetwork/polkadot-provider/lib/command/labs/services';
import { queryLabById } from '@debionetwork/polkadot-provider/lib/query/labs';
import {
  queryServicesByMultipleIds,
  queryServicesCount,
} from '@debionetwork/polkadot-provider/lib/query/labs/services';
import { Lab } from '@debionetwork/polkadot-provider/lib/models/labs';
import { deregisterLab } from '@debionetwork/polkadot-provider/lib/command/labs';
import { labDataMock } from '../../../../../mock/models/labs/labs.mock';
import { Service } from '@debionetwork/polkadot-provider/lib/models/labs/services';
import {
  Order,
  OrderStatus,
} from '@debionetwork/polkadot-provider/lib/models/labs/orders';
import { serviceDataMock } from '../../../../../mock/models/labs/services.mock';
import { DnaSampleStatus } from '@debionetwork/polkadot-provider/lib/models/labs/genetic-testing/dna-sample-status';
import { TestingModule } from '@nestjs/testing/testing-module';
import { Test } from '@nestjs/testing/test';
import { INestApplication } from '@nestjs/common/interfaces/nest-application.interface';
import { initializeApi } from '../../../../polkadot-init';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { LabRating } from '../../../../../mock/models/rating/rating.entity';
import { TransactionRequest } from '../../../../../../src/common/transaction-logging/models/transaction-request.entity';
import { dummyCredentials } from '../../../../config';
import { EscrowService } from '../../../../../../src/common/escrow/escrow.service';
import { escrowServiceMockFactory } from '../../../../../unit/mock';
import {
  DateTimeModule,
  NotificationModule,
  ProcessEnvModule,
  SubstrateModule,
  TransactionLoggingModule,
} from '../../../../../../src/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SubstrateListenerHandler } from '../../../../../../src/listeners/substrate-listener/substrate-listener.handler';
import { Notification } from '../../../../../../src/common/notification/models/notification.entity';
import { createConnection } from 'typeorm';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { OrderPaidHandler } from '../../../../../../src/listeners/substrate-listener/commands/orders/order-paid/order-paid.handler';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

describe('Order Fulfilled Integration Tests', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
  let lab: Lab;
  let service: Service;
  let order: Order;

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
        CqrsModule,
        SubstrateModule,
        DateTimeModule,
        NotificationModule,
        MailerModule.forRootAsync({
          imports: [GCloudSecretManagerModule.withConfig(process.env.PARENT)],
          inject: [GCloudSecretManagerService],
          useFactory: async (
            gCloudSecretManagerService: GCloudSecretManagerService,
          ) => {
            return {
              transport: {
                host: 'smtp.gmail.com',
                secure: false,
                auth: {
                  user: process.env.EMAIL,
                  pass: gCloudSecretManagerService
                    .getSecret('PASS_EMAIL')
                    .toString(),
                },
              },
              template: {
                dir: join(
                  __dirname,
                  '../../../../../../src/listeners/substrate-listener/templates',
                ),
                adapter: new HandlebarsAdapter({
                  colNum: (value) => parseInt(value) + 1,
                }), // or new PugAdapter() or new EjsAdapter()
                options: {
                  strict: true,
                },
              },
            };
          },
        }),
      ],
      providers: [
        {
          provide: EscrowService,
          useFactory: escrowServiceMockFactory,
        },
        SubstrateListenerHandler,
        OrderPaidHandler,
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
    app.flushLogs();
    await api.disconnect();
    await app.close();
    app = null;
    api = null;
  });

  it('fulfill order event', async () => {
    // eslint-disable-next-line
    const labPromise: Promise<Lab> = new Promise((resolve, reject) => {
      queryLabById(api, pair.address).then((res) => {
        resolve(res);
      });
    });

    lab = await labPromise;
    expect(lab.info).toEqual(labDataMock.info);

    // eslint-disable-next-line
    const servicePromise: Promise<Service> = new Promise((resolve, reject) => {
      queryLabById(api, pair.address).then((lab) => {
        queryServicesByMultipleIds(api, lab.services).then((res) => {
          resolve(res[0]);
        });
      });
    });

    service = await servicePromise;

    // eslint-disable-next-line
    const orderPromise: Promise<Order> = new Promise((resolve, reject) => {
      createOrder(
        api,
        pair,
        service.id,
        0,
        lab.info.boxPublicKey,
        serviceDataMock.serviceFlow,
        () => {
          queryLastOrderHashByCustomer(api, pair.address).then((orderId) => {
            queryOrderDetailByOrderID(api, orderId).then((res) => {
              resolve(res);
            });
          });
        },
      );
    });

    order = await orderPromise;
    expect(order.customerId).toEqual(pair.address);
    expect(order.sellerId).toEqual(pair.address);
    expect(order.serviceId).toEqual(service.id);
    expect(order.customerBoxPublicKey).toEqual(lab.info.boxPublicKey);
    expect(order.orderFlow).toEqual(serviceDataMock.serviceFlow);

    await submitTestResult(api, pair, order.dnaSampleTrackingId, {
      comments: 'comment',
      resultLink: 'resultLink',
      reportLink: 'reportLink',
    });

    await processDnaSample(
      api,
      pair,
      order.dnaSampleTrackingId,
      DnaSampleStatus.ResultReady,
    );

    const paidOrderPromise: Promise<Order> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        setOrderPaid(api, pair, order.id, () => {
          queryOrderDetailByOrderID(api, order.id).then((res) => {
            resolve(res);
          });
        });
      },
    );

    expect((await paidOrderPromise).status).toEqual(OrderStatus.Paid);

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
          to: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          entity: 'New Order',
          role: 'Lab',
        },
      )
      .getMany();

    expect(notifications.length).toEqual(1);
    expect(notifications[0].to).toEqual(
      '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    );
    expect(notifications[0].entity).toEqual('New Order');
    expect(
      notifications[0].description.includes(
        `A new order ([]) is awaiting process.`,
      ),
    ).toBeTruthy();
    expect(notifications[0].reference_id).toEqual(order.id);

    // eslint-disable-next-line
    const deletePromise: Promise<number> = new Promise((resolve, reject) => {
      deleteService(api, pair, service.id, () => {
        queryServicesCount(api).then((res) => {
          deregisterLab(api, pair, () => {
            resolve(res);
          });
        });
      });
    });

    expect(await deletePromise).toEqual(0);

    await dbConnection.destroy();
  }, 180000);
});
