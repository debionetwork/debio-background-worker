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
  retrieveUnstakedAmount,
  Service,
  ServiceRequest,
  unstakeRequest,
  updateLabVerificationStatus,
} from '@debionetwork/polkadot-provider';
import { labDataMock } from '../../../../../mock/models/labs/labs.mock';
import { serviceDataMock } from '../../../../../mock/models/labs/services.mock';
import { serviceRequestMock } from '../../../../../mock/models/labs/service-request.mock';
import { createConnection } from 'typeorm';
import { Notification } from '../../../../../../src/common/notification/models/notification.entity';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';

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
  });

  it('service request staking amount refunded event', async () => {
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

    const unstakeServiceRequestPromise: Promise<ServiceRequest> = new Promise(
      (resolve, reject) => {
        unstakeRequest(api, pair, serviceRequest.hash, () => {
          queryServiceRequestById(api, serviceRequest.hash).then((res) => {
            resolve(res);
          });
        });
      },
    );

    serviceRequest = await unstakeServiceRequestPromise;

    const retrieveUnstakeServiceRequestPromise: Promise<ServiceRequest> =
      new Promise((resolve, reject) => {
        retrieveUnstakedAmount(api, pair, serviceRequest.hash, () => {
          queryServiceRequestById(api, serviceRequest.hash).then((res) => {
            resolve(res);
          });
        });
      });

    serviceRequest = await retrieveUnstakeServiceRequestPromise;

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
        entity: 'Requested Service Unstaked',
      })
      .getMany();

    expect(notifications[0].to).toEqual(serviceRequest.requesterAddress);
    expect(notifications[0].entity).toEqual('Requested Service Unstaked');
    expect(
      notifications[0].description.includes(
        `Your staked amount from staking ID ${serviceRequest.hash} has been refunded, kindly check your balance.`,
      ),
    ).toBeTruthy();
  });
});
