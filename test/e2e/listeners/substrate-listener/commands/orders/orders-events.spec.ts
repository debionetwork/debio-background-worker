import { ApiPromise } from '@polkadot/api';
import 'regenerator-runtime/runtime';
import {
  queryLastOrderHashByCustomer,
  queryOrderDetailByOrderID,
} from '@debionetwork/polkadot-provider/lib/query/labs/orders';
import {
  createOrder,
  fulfillOrder,
  setOrderPaid,
} from '@debionetwork/polkadot-provider/lib/command/labs/orders';
import {
  processDnaSample,
  rejectDnaSample,
  submitTestResult,
} from '@debionetwork/polkadot-provider/lib/command/labs/genetic-testing';
import {
  queryDnaSamples,
  queryLabById,
} from '@debionetwork/polkadot-provider/lib/query/labs';
import {
  queryServicesByMultipleIds,
  queryServicesCount,
} from '@debionetwork/polkadot-provider/lib/query/labs/services';
import { Lab } from '@debionetwork/polkadot-provider/lib/models/labs';
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
import { TransactionRequest } from '@common/transaction-logging/models/transaction-request.entity';
import { dummyCredentials } from '../../../../config';
import { EscrowService } from '@common/escrow/escrow.service';
import {
  escrowServiceMockFactory,
  mailerManagerMockFactory,
} from '../../../../../unit/mock';
import {
  DateTimeModule,
  DebioConversionModule,
  MailerManager,
  NotificationModule,
  ProcessEnvModule,
  SubstrateModule,
  TransactionLoggingModule,
} from '@common/index';
import { CqrsModule } from '@nestjs/cqrs';
import { SubstrateListenerHandler } from '@listeners/substrate-listener/substrate-listener.handler';
import { Notification } from '@common/notification/models/notification.entity';
import { createConnection } from 'typeorm';
import { DnaSample } from '@debionetwork/polkadot-provider/lib/models/labs/genetic-testing/dna-sample';
import { OrderFailedHandler } from '@listeners/substrate-listener/commands/orders/order-failed/order-failed.handler';
import { deleteService, deregisterLab } from '@debionetwork/polkadot-provider';
import { OrderFulfilledHandler } from '@listeners/substrate-listener/commands/orders/order-fulfilled/order-fulfilled.handler';
import { OrderPaidHandler } from '@listeners/substrate-listener/commands/orders/order-paid/order-paid.handler';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { config } from '../../../../../../src/config';

describe('Order Failed Integration Tests', () => {
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

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
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
        DebioConversionModule,
        MailerModule.forRootAsync({
          imports: [],
          inject: [],
          useFactory: async () => {
            console.log(config.EMAIL.toString(), config.PASS_EMAIL.toString());
            return {
              transport: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                  user: config.EMAIL.toString(),
                  pass: config.PASS_EMAIL.toString(),
                },
              },
              template: {
                dir: join(__dirname, '@listeners/substrate-listener/templates'),
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
        {
          provide: MailerManager,
          useFactory: mailerManagerMockFactory,
        },
        SubstrateListenerHandler,
        OrderFailedHandler,
        OrderFulfilledHandler,
        OrderPaidHandler,
      ],
    }).compile();

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

  it('failed order event', async () => {
    // eslint-disable-next-line
    const labPromise: Promise<Lab> = new Promise((resolve, reject) => {
      queryLabById(api, pair.address).then((res) => {
        resolve(res);
      });
    });

    const lab: Lab = await labPromise;
    expect(lab.info).toEqual(labDataMock.info);

    // eslint-disable-next-line
    const servicePromise: Promise<Service> = new Promise((resolve, reject) => {
      queryLabById(api, pair.address).then((lab) => {
        queryServicesByMultipleIds(api, lab.services).then((res) => {
          resolve(res[0]);
        });
      });
    });

    const service: Service = await servicePromise;

    // eslint-disable-next-line
    const orderPromise: Promise<Order> = new Promise((resolve, reject) => {
      createOrder(
        api,
        pair,
        service.id,
        0,
        lab.info.boxPublicKey,
        serviceDataMock.serviceFlow,
        0,
        () => {
          queryLastOrderHashByCustomer(api, pair.address).then((orderId) => {
            queryOrderDetailByOrderID(api, orderId).then((res) => {
              resolve(res);
            });
          });
        },
      );
    });

    const order: Order = await orderPromise;
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
      DnaSampleStatus.Arrived,
    );
    const rejectedTitle = 'REJECTED';
    const rejectedDescription = 'REJECTED_DESCRIPTION';

    const rejectDnaSamplePromise: Promise<DnaSample> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        rejectDnaSample(
          api,
          pair,
          order.dnaSampleTrackingId,
          rejectedTitle,
          rejectedDescription,
          () => {
            queryDnaSamples(api, order.dnaSampleTrackingId).then((res) => {
              resolve(res);
            });
          },
        );
      },
    );

    const dnaSample = await rejectDnaSamplePromise;
    expect(dnaSample.labId).toEqual(order.sellerId);
    expect(dnaSample.ownerId).toEqual(order.customerId);
    expect(dnaSample.trackingId).toEqual(order.dnaSampleTrackingId);
    expect(dnaSample.status).toEqual(DnaSampleStatus.Rejected);
    expect(dnaSample.rejectedTitle).toEqual(rejectedTitle);
    expect(dnaSample.rejectedDescription).toEqual(rejectedDescription);

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
          entity: 'Order Failed',
          role: 'Lab',
        },
      )
      .getMany();

    expect(notifications.length).toEqual(1);
    expect(notifications[0].to).toEqual(
      '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    );
    expect(notifications[0].entity).toEqual('Order Failed');
    expect(
      notifications[0].description.includes('You’ve received'),
    ).toBeTruthy();
    expect(
      notifications[0].description.includes('DAI as quality control fees for'),
    ).toBeTruthy();

    await dbConnection.destroy();
  }, 200000);

  it('fulfill order event', async () => {
    // eslint-disable-next-line
    const labPromise: Promise<Lab> = new Promise((resolve, reject) => {
      queryLabById(api, pair.address).then((res) => {
        resolve(res);
      });
    });

    const lab: Lab = await labPromise;
    expect(lab.info).toEqual(labDataMock.info);

    // eslint-disable-next-line
    const servicePromise: Promise<Service> = new Promise((resolve, reject) => {
      queryLabById(api, pair.address).then((lab) => {
        queryServicesByMultipleIds(api, lab.services).then((res) => {
          resolve(res[0]);
        });
      });
    });

    const service: Service = await servicePromise;

    // eslint-disable-next-line
    const orderPromise: Promise<Order> = new Promise((resolve, reject) => {
      createOrder(
        api,
        pair,
        service.id,
        0,
        lab.info.boxPublicKey,
        serviceDataMock.serviceFlow,
        0,
        () => {
          queryLastOrderHashByCustomer(api, pair.address).then((orderId) => {
            queryOrderDetailByOrderID(api, orderId).then((res) => {
              resolve(res);
            });
          });
        },
      );
    });

    const order: Order = await orderPromise;
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

    const fulfillOrderPromise: Promise<Order> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        fulfillOrder(api, pair, order.id, () => {
          queryOrderDetailByOrderID(api, order.id).then((res) => {
            resolve(res);
          });
        });
      },
    );

    expect((await fulfillOrderPromise).status).toEqual(OrderStatus.Fulfilled);

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
          to: order.sellerId,
          entity: 'Order Fulfilled',
          role: 'Lab',
        },
      )
      .getMany();

    expect(notifications.length).toEqual(1);
    expect(notifications[0].to).toEqual(order.sellerId);
    expect(notifications[0].entity).toEqual('Order Fulfilled');
    expect(
      notifications[0].description.includes("You've received 2e-18 DAI"),
    ).toBeTruthy();

    await dbConnection.destroy();
  }, 200000);

  it('fulfill order event', async () => {
    // eslint-disable-next-line
    const labPromise: Promise<Lab> = new Promise((resolve, reject) => {
      queryLabById(api, pair.address).then((res) => {
        resolve(res);
      });
    });

    const lab = await labPromise;
    expect(lab.info).toEqual(labDataMock.info);

    // eslint-disable-next-line
    const servicePromise: Promise<Service> = new Promise((resolve, reject) => {
      queryLabById(api, pair.address).then((lab) => {
        queryServicesByMultipleIds(api, lab.services).then((res) => {
          resolve(res[0]);
        });
      });
    });

    const service = await servicePromise;

    // eslint-disable-next-line
    const orderPromise: Promise<Order> = new Promise((resolve, reject) => {
      createOrder(
        api,
        pair,
        service.id,
        0,
        lab.info.boxPublicKey,
        serviceDataMock.serviceFlow,
        0,
        () => {
          queryLastOrderHashByCustomer(api, pair.address).then((orderId) => {
            queryOrderDetailByOrderID(api, orderId).then((res) => {
              resolve(res);
            });
          });
        },
      );
    });

    const order = await orderPromise;
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
