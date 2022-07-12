import { ApiPromise } from '@polkadot/api';
import 'regenerator-runtime/runtime';
import {
  deregisterLab,
  stakeLab,
  updateLabVerificationStatus,
} from '@debionetwork/polkadot-provider/lib/command/labs';
import { queryLabById } from '@debionetwork/polkadot-provider/lib/query/labs';
import { Lab } from '@debionetwork/polkadot-provider/lib/models/labs';
import { registerLab } from '@debionetwork/polkadot-provider/lib/command/labs';
import { labDataMock } from '../../../../../mock/models/labs/labs.mock';
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
  DebioConversionModule,
  MailModule,
  NotificationModule,
  ProcessEnvModule,
  SubstrateModule,
  TransactionLoggingModule,
} from '../../../../../../src/common';
import { LocationModule } from '../../../../../../src/common/location/location.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SubstrateListenerHandler } from '../../../../../../src/listeners/substrate-listener/substrate-listener.handler';
import { LabStakeSuccessfullHandler } from '../../../../../../src/listeners/substrate-listener/commands/labs/stake-successfull/stake-successful.handler';
import { createConnection } from 'typeorm';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';
import { Notification } from '../../../../../../src/common/notification/models/notification.entity';

describe('lab staking Integration Tests', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
  let lab: Lab;

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
          entities: [LabRating, TransactionRequest],
          autoLoadEntities: true,
        }),
        ProcessEnvModule,
        TransactionLoggingModule,
        SubstrateModule,
        CqrsModule,
        DateTimeModule,
      ],
      providers: [
        {
          provide: EscrowService,
          useFactory: escrowServiceMockFactory,
        },
        SubstrateListenerHandler,
        LabStakeSuccessfullHandler,
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

  it('register lab event', async () => {
    const createLabPromise: Promise<Lab> = new Promise((resolve, reject) => {
      registerLab(api, pair, labDataMock.info, () => {
        queryLabById(api, pair.address).then((res) => {
          resolve(res);
        });
      });
    });

    lab = await createLabPromise;
    expect(lab.info).toEqual(labDataMock.info);
    expect(lab.verificationStatus).toEqual(VerificationStatus.Unverified);
  });

  it('verified lab event', async () => {
    const registerVerifiedLabPromise: Promise<Lab> = new Promise(
      (resolve, reject) => {
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
      },
    );

    lab = await registerVerifiedLabPromise;
    expect(lab.info).toEqual(labDataMock.info);
    expect(lab.verificationStatus).toEqual(VerificationStatus.Verified);

    const dbConnection = await createConnection({
      ...dummyCredentials,
      database: 'db_postgres',
      entities: [TransactionRequest],
      synchronize: true,
    });

    const notifications = await dbConnection
      .getRepository(Notification)
      .createQueryBuilder('notification')
      .where('notification.to = :to', {
        to: lab.accountId,
      })
      .where('notification.entity = :entity', { entity: 'Account Verified' })
      .getMany();

    expect(notifications.length).toEqual(1);
    expect(notifications[0].to).toEqual(lab.accountId);
    expect(notifications[0].entity).toEqual('Account Verified');
    expect(
      notifications[0].description.includes(
        'Congrats! Your account has been verified.',
      ),
    ).toBeTruthy();
  });

  it('resolve lab event', async () => {
    const registerResolveLabPromise: Promise<Lab> = new Promise(
      (resolve, reject) => {
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
      },
    );

    lab = await registerResolveLabPromise;
    expect(lab.info).toEqual(labDataMock.info);
    expect(lab.verificationStatus).toEqual(VerificationStatus.Revoked);

    const dbConnection = await createConnection({
      ...dummyCredentials,
      database: 'db_postgres',
      entities: [TransactionRequest],
      synchronize: true,
    });

    const notifications = await dbConnection
      .getRepository(Notification)
      .createQueryBuilder('notification')
      .where('notification.to = :to', {
        to: lab.accountId,
      })
      .where('notification.entity = :entity', { entity: 'Account Revoked' })
      .getMany();

    expect(notifications.length).toEqual(1);
    expect(notifications[0].to).toEqual(lab.accountId);
    expect(notifications[0].entity).toEqual('Account Revoked');
    expect(
      notifications[0].description.includes('Your account has been revoked.'),
    ).toBeTruthy();
  });

  it('reject lab event', async () => {
    const registerRejectLabPromise: Promise<Lab> = new Promise(
      (resolve, reject) => {
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
      },
    );

    lab = await registerRejectLabPromise;
    expect(lab.info).toEqual(labDataMock.info);
    expect(lab.verificationStatus).toEqual(VerificationStatus.Rejected);

    const dbConnection = await createConnection({
      ...dummyCredentials,
      database: 'db_postgres',
      entities: [TransactionRequest],
      synchronize: true,
    });

    const notifications = await dbConnection
      .getRepository(Notification)
      .createQueryBuilder('notification')
      .where('notification.to = :to', {
        to: lab.accountId,
      })
      .where('notification.entity = :entity', { entity: 'Account Rejected' })
      .getMany();

    expect(notifications.length).toEqual(1);
    expect(notifications[0].to).toEqual(lab.accountId);
    expect(notifications[0].entity).toEqual('Account Rejected');
    expect(
      notifications[0].description.includes(
        'Your account verification has been rejected.',
      ),
    ).toBeTruthy();
  });
});
