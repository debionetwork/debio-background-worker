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
  createRequest,
  queryServiceRequestByAccountId,
  queryServiceRequestById,
  retrieveUnstakedAmount,
  ServiceRequest,
  unstakeRequest,
} from '@debionetwork/polkadot-provider';
import { serviceRequestMock } from '../../../../../mock/models/labs/service-request.mock';
import { createConnection } from 'typeorm';
import { Notification } from '../../../../../../src/common/notification/models/notification.entity';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { ServiceRequestStakingAmountRefundedHandler } from '../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-staking-amount-refunded/service-request-staking-amount-refunded.handler';

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
        GCloudSecretManagerModule.withConfig(process.env.PARENT),
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
        ServiceRequestStakingAmountRefundedHandler,
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
  }, 12000);

  it('service request staking amount refunded event', async () => {
    let serviceRequest: ServiceRequest;

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
      // eslint-disable-next-line
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
      // eslint-disable-next-line
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
      .where(
        'notification.to = :to AND notification.entity = :entity AND notification.role = :role',
        {
          to: serviceRequest.requesterAddress,
          entity: 'Requested Service Unstaked',
          role: 'Customer',
        },
      )
      .getMany();

    expect(notifications.length).toEqual(1);
    expect(notifications[0].to).toEqual(serviceRequest.requesterAddress);
    expect(notifications[0].entity).toEqual('Requested Service Unstaked');
    expect(
      notifications[0].description.includes(
        `Your staked amount from staking ID ${serviceRequest.hash} has been refunded, kindly check your balance.`,
      ),
    ).toBeTruthy();
  }, 180000);
});
