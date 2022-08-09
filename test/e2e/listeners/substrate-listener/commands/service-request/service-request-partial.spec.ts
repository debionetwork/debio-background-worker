import { INestApplication } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiPromise } from '@polkadot/api';
import {
  DateTimeModule,
  NotificationModule,
  ProcessEnvModule,
  SubstrateModule,
  TransactionLoggingModule,
} from '../../../../../../src/common';
import { EscrowService } from '../../../../../../src/common/escrow/escrow.service';
import { TransactionRequest } from '../../../../../../src/common/transaction-logging/models/transaction-request.entity';
import { LabRating } from '../../../../../mock/models/rating/rating.entity';
import { SubstrateListenerHandler } from '../../../../../../src/listeners/substrate-listener/substrate-listener.handler';
import { dummyCredentials } from '../../../../config';
import { escrowServiceMockFactory } from '../../../../../unit/mock';
import { initializeApi } from '../../../../polkadot-init';
import {
  createOrder,
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
  Service,
  ServiceRequest,
} from '@debionetwork/polkadot-provider';
import { labDataMock } from '../../../../../mock/models/labs/labs.mock';
import { serviceDataMock } from '../../../../../mock/models/labs/services.mock';
import { serviceRequestMock } from '../../../../../mock/models/labs/service-request.mock';
import { createConnection } from 'typeorm';
import { Notification } from '../../../../../../src/common/notification/models/notification.entity';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { ServiceRequestStakingAmountIncreasedHandler } from '../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-partial/service-request-partial.handler';

describe('Service Request Excess Integration Tests', () => {
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
          entities: [LabRating, TransactionRequest, Notification],
          autoLoadEntities: true,
        }),
        ProcessEnvModule,
        TransactionLoggingModule,
        CqrsModule,
        SubstrateModule,
        DateTimeModule,
        NotificationModule,
      ],
      providers: [
        {
          provide: EscrowService,
          useFactory: escrowServiceMockFactory,
        },
        SubstrateListenerHandler,
        ServiceRequestStakingAmountIncreasedHandler,
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

  it('service request partial event', async () => {
    let serviceRequest: ServiceRequest;

    const serviceRequestPromise: Promise<ServiceRequest> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        queryServiceRequestByAccountId(api, pair.address).then((res) => {
          resolve(res.at(-1));
        });
      },
    );

    serviceRequest = await serviceRequestPromise;
    serviceRequest = serviceRequest.normalize();
    expect(serviceRequest).toEqual(
      expect.objectContaining({
        country: serviceRequestMock.country,
        region: serviceRequestMock.region,
        city: serviceRequestMock.city,
      }),
    );

    // eslint-disable-next-line
    const labPromise: Promise<Lab> = new Promise((resolve, reject) => {
      queryLabById(api, pair.address).then((res) => {
        resolve(res);
      });
    });

    const lab: Lab = await labPromise;
    expect(lab.info).toEqual(labDataMock.info);
    expect(lab.verificationStatus).toEqual(VerificationStatus.Verified);

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
      .where(
        'notification.to = :to AND notification.entity = :entity AND notification.role = :role',
        {
          to: serviceRequest.requesterAddress,
          entity: 'Service Request Staking Amount Increased',
          role: 'Customer',
        },
      )
      .getMany();

    expect(notifications.length).toEqual(1);
    expect(notifications[0].to).toEqual(serviceRequest.requesterAddress);
    expect(notifications[0].entity).toEqual(
      'Service Request Staking Amount Increased',
    );
    expect(
      notifications[0].description.includes(
        `Your partial payment staking service request with ID [] has been increased.`,
      ),
    ).toBeTruthy();
    expect(notifications[0].reference_id).toEqual(serviceRequest.hash);
    expect(notifications[0].from).toEqual('Debio Network');

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
  }, 200000);
});
