import { INestApplication } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiPromise } from '@polkadot/api';
import {
  DateTimeModule,
  DebioConversionModule,
  MailModule,
  NotificationModule,
  ProcessEnvModule,
  SubstrateModule,
  TransactionLoggingModule,
} from '../../../../../../src/common';
import { EscrowService } from '../../../../../../src/common/escrow/escrow.service';
import { TransactionRequest } from '../../../../../../src/common/transaction-logging/models/transaction-request.entity';
import { LocationModule } from '../../../../../../src/common/location/location.module';
import { LocationEntities } from '../../../../../../src/common/location/models';
import { LabRating } from '../../../../../mock/models/rating/rating.entity';
import { ServiceRequestCommandHandlers } from '../../../../../../src/listeners/substrate-listener/commands/service-request';
import { SubstrateListenerHandler } from '../../../../../../src/listeners/substrate-listener/substrate-listener.handler';
import { dummyCredentials } from '../../../../config';
import { escrowServiceMockFactory } from '../../../../../unit/mock';
import { initializeApi } from '../../../../polkadot-init';
import {
  claimRequest,
  createOrder,
  createRequest,
  createService,
  deleteService,
  deregisterLab,
  Lab,
  Order,
  processRequest,
  queryLabById,
  queryLastOrderHashByCustomer,
  queryOrderDetailByOrderID,
  queryServiceRequestByAccountId,
  queryServiceRequestById,
  queryServicesByMultipleIds,
  queryServicesCount,
  registerLab,
  Service,
  ServiceRequest,
  updateLabVerificationStatus,
} from '@debionetwork/polkadot-provider';
import { labDataMock } from '../../../../../mocks/models/labs/labs.mock';
import { serviceDataMock } from '../../../../../mocks/models/labs/services.mock';
import { serviceRequestMock } from '../../../../../mocks/models/labs/service-request.mock';
import { createConnection } from 'typeorm';
import { Notification } from '../../../../../../src/common/notification/models/notification.entity';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';

describe('Service Request Excess Integration Tests', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
  let lab: Lab;
  let service: Service;
  let order: Order;
  let serviceRequest: ServiceRequest;

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
          entities: [LabRating, TransactionRequest, Notification],
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
        LocationModule,
        TransactionLoggingModule,
        SubstrateModule,
        DebioConversionModule,
        MailModule,
        CqrsModule,
        DateTimeModule,
        NotificationModule,
        ElasticsearchModule.registerAsync({
          useFactory: async () => ({
            node: process.env.ELASTICSEARCH_NODE,
            auth: {
              username: process.env.ELASTICSEARCH_USERNAME,
              password: process.env.ELASTICSEARCH_PASSWORD,
            },
          }),
        }),
      ],
      providers: [
        {
          provide: EscrowService,
          useFactory: escrowServiceMockFactory,
        },
        SubstrateListenerHandler,
        ...ServiceRequestCommandHandlers,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    const { api: _api, pair: _pair } = await initializeApi();
    api = _api;
    pair = _pair;
  }, 360000);

  afterAll(async () => {
    await api.disconnect();
    await app.close();
  });

  it('service request excess event', async () => {
    const serviceRequestPromise: Promise<ServiceRequest> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        createRequest(
          api,
          pair,
          serviceRequestMock.country,
          serviceRequestMock.region,
          serviceRequestMock.city,
          serviceRequestMock.serviceCategory,
          serviceRequestMock.stakingAmount,
          () => {
            queryServiceRequestByAccountId(api, pair.address).then((res) => {
              resolve(res.at(-1));
            });
          },
        );
      },
    );

    serviceRequest = await serviceRequestPromise;
    expect(serviceRequest.normalize()).toEqual(
      expect.objectContaining({
        country: serviceRequestMock.country,
        region: serviceRequestMock.region,
        city: serviceRequestMock.city,
      }),
    );

    // eslint-disable-next-line
    const labPromise: Promise<Lab> = new Promise((resolve, reject) => {
      registerLab(api, pair, labDataMock.info, () => {
        updateLabVerificationStatus(
          api,
          pair,
          pair.address,
          VerificationStatus.Verified,
          () => {
            queryLabById(api, pair.address).then((res) => {
              resolve(res);
            });
          },
        );
      });
    });

    lab = await labPromise;
    expect(lab.info).toEqual(labDataMock.info);
    expect(lab.verificationStatus).toEqual(VerificationStatus.Verified);

    // eslint-disable-next-line
    const servicePromise: Promise<Service> = new Promise((resolve, reject) => {
      createService(
        api,
        pair,
        serviceDataMock.info,
        serviceDataMock.serviceFlow,
        () => {
          queryLabById(api, pair.address).then((lab) => {
            queryServicesByMultipleIds(api, lab.services).then((res) => {
              resolve(res[0]);
            });
          });
        },
      );
    });

    service = await servicePromise;

    const claimRequestPromise: Promise<ServiceRequest> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        claimRequest(
          api,
          pair,
          serviceRequest.hash,
          service.id,
          '800000000000000000',
          '100000000000000000',
          () => {
            queryServiceRequestById(api, serviceRequest.hash).then((res) => {
              resolve(res);
            });
          },
        );
      },
    );

    serviceRequest = await claimRequestPromise;

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

    const processRequestPromise: Promise<ServiceRequest> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        processRequest(
          api,
          pair,
          lab.accountId,
          serviceRequest.hash,
          order.id,
          order.dnaSampleTrackingId,
          '0',
          () => {
            queryServiceRequestById(api, serviceRequest.hash).then((res) => {
              resolve(res);
            });
          },
        );
      },
    );

    serviceRequest = await processRequestPromise;

    const dbConnection = await createConnection({
      ...dummyCredentials,
      database: 'db_postgres',
      entities: [Notification],
      synchronize: true,
    });

    const notifications = await dbConnection
      .getRepository(Notification)
      .createQueryBuilder('notification')
      .where('notification.to = :to', {
        to: serviceRequest.requesterAddress,
      })
      .where('notification.entity = :entity', {
        entity: 'ServiceRequestStakingAmountExessRefunded',
      })
      .getMany();

    expect(notifications[0].to).toEqual(serviceRequest.requesterAddress);
    expect(notifications[0].entity).toEqual(
      'ServiceRequestStakingAmountExessRefunded',
    );
    expect(
      notifications[0].description.includes(
        `Your over payment staking service request with ID ${serviceRequest.hash} has been refunded.`,
      ),
    ).toBeTruthy();

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
  }, 240000);
});
