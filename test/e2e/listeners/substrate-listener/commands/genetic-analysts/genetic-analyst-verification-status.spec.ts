import {
  deregisterGeneticAnalyst,
  GeneticAnalyst,
  queryGeneticAnalystByAccountId,
  queryGeneticAnalystCount,
  updateGeneticAnalystVerificationStatus,
} from '@debionetwork/polkadot-provider';
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
import { dummyCredentials } from '../../../../../e2e/config';
import { escrowServiceMockFactory } from '../../../../../unit/mock';
import { initializeApi } from '../../../../../e2e/polkadot-init';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';
import { Notification } from '../../../../../../src/common/notification/models/notification.entity';
import { createConnection } from 'typeorm';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { GeneticAnalystVerificationStatusHandler } from '../../../../../../src/listeners/substrate-listener/commands/genetic-analysts/genetic-analyst-verification-status/genetic-analyst-verification-status.handler';
import { SecretKeyList } from '../../../../../../src/common/secrets';

describe('Genetic analyst verification status', () => {
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
        GCloudSecretManagerModule.withConfig(
          process.env.GCS_PARENT,
          SecretKeyList,
        ),
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
        GeneticAnalystVerificationStatusHandler,
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

  it('update verification status genetic analyst', async () => {
    let ga: GeneticAnalyst;

    const geneticAnalystPromise: Promise<GeneticAnalyst> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
          resolve(res);
        });
      },
    );

    ga = await geneticAnalystPromise;

    expect(ga.info).toEqual(
      expect.objectContaining({
        boxPublicKey:
          '0x6d206b37fdbe72caeaf73a50dbe455f146933c26c67e8d279565bfc3076ef90a',
        firstName: 'string',
        lastName: 'string',
        gender: 'string',
        dateOfBirth: '0',
        email: 'string',
        phoneNumber: 'string',
        specialization: 'string',
        profileLink: 'string',
        profileImage: 'string',
      }),
    );

    const updateGeneticAnalystVerificationPromise: Promise<GeneticAnalyst> =
      new Promise(
        // eslint-disable-next-line
        (resolve, reject) => {
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
        },
      );

    ga = await updateGeneticAnalystVerificationPromise;

    expect(ga.info).toEqual(
      expect.objectContaining({
        boxPublicKey:
          '0x6d206b37fdbe72caeaf73a50dbe455f146933c26c67e8d279565bfc3076ef90a',
        firstName: 'string',
        lastName: 'string',
        gender: 'string',
        dateOfBirth: '0',
        email: 'string',
        phoneNumber: 'string',
        specialization: 'string',
        profileLink: 'string',
        profileImage: 'string',
      }),
    );
    expect(ga.verificationStatus).toEqual(VerificationStatus.Verified);

    const dbConnection = await createConnection({
      ...dummyCredentials,
      database: 'db_postgres',
      entities: [Notification],
      synchronize: true,
    });

    const notificationsVerification = await dbConnection
      .getRepository(Notification)
      .createQueryBuilder('notification')
      .where(
        'notification.to = :to AND notification.entity = :entity AND notification.role = :role',
        {
          to: ga.accountId,
          entity: 'Account verified',
          role: 'GA',
        },
      )
      .getMany();

    expect(notificationsVerification.length).toEqual(1);
    expect(notificationsVerification[0].to).toEqual(ga.accountId);
    expect(notificationsVerification[0].entity).toEqual('Account verified');
    expect(
      notificationsVerification[0].description.includes(
        'Congrats! Your account has been verified.',
      ),
    ).toBeTruthy();

    const updateGeneticAnalystRevokedPromise: Promise<GeneticAnalyst> =
      new Promise(
        // eslint-disable-next-line
        (resolve, reject) => {
          updateGeneticAnalystVerificationStatus(
            api,
            pair,
            pair.address,
            VerificationStatus.Revoked,
            () => {
              queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
                resolve(res);
              });
            },
          );
        },
      );

    ga = await updateGeneticAnalystRevokedPromise;

    expect(ga.info).toEqual(
      expect.objectContaining({
        boxPublicKey:
          '0x6d206b37fdbe72caeaf73a50dbe455f146933c26c67e8d279565bfc3076ef90a',
        firstName: 'string',
        lastName: 'string',
        gender: 'string',
        dateOfBirth: '0',
        email: 'string',
        phoneNumber: 'string',
        specialization: 'string',
        profileLink: 'string',
        profileImage: 'string',
      }),
    );
    expect(ga.verificationStatus).toEqual(VerificationStatus.Revoked);

    const notificationsRevoke = await dbConnection
      .getRepository(Notification)
      .createQueryBuilder('notification')
      .where(
        'notification.to = :to AND notification.entity = :entity AND notification.role = :role',
        {
          to: ga.accountId,
          entity: 'Account revoked',
          role: 'GA',
        },
      )
      .getMany();

    expect(notificationsRevoke.length).toEqual(1);
    expect(notificationsRevoke[0].to).toEqual(ga.accountId);
    expect(notificationsRevoke[0].entity).toEqual('Account revoked');
    expect(
      notificationsRevoke[0].description.includes(
        'Your account has been revoked.',
      ),
    ).toBeTruthy();

    const updateGeneticAnalystRejectedPromise: Promise<GeneticAnalyst> =
      new Promise(
        // eslint-disable-next-line
        (resolve, reject) => {
          updateGeneticAnalystVerificationStatus(
            api,
            pair,
            pair.address,
            VerificationStatus.Rejected,
            () => {
              queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
                resolve(res);
              });
            },
          );
        },
      );

    ga = await updateGeneticAnalystRejectedPromise;

    expect(ga.info).toEqual(
      expect.objectContaining({
        boxPublicKey:
          '0x6d206b37fdbe72caeaf73a50dbe455f146933c26c67e8d279565bfc3076ef90a',
        firstName: 'string',
        lastName: 'string',
        gender: 'string',
        dateOfBirth: '0',
        email: 'string',
        phoneNumber: 'string',
        specialization: 'string',
        profileLink: 'string',
        profileImage: 'string',
      }),
    );
    expect(ga.verificationStatus).toEqual(VerificationStatus.Rejected);

    const notificationsRejected = await dbConnection
      .getRepository(Notification)
      .createQueryBuilder('notification')
      .where(
        'notification.to = :to AND notification.entity = :entity AND notification.role = :role',
        {
          to: ga.accountId,
          entity: 'Account rejected',
          role: 'GA',
        },
      )
      .getMany();

    expect(notificationsRejected.length).toEqual(1);
    expect(notificationsRejected[0].to).toEqual(ga.accountId);
    expect(notificationsRejected[0].entity).toEqual('Account rejected');
    expect(
      notificationsRejected[0].description.includes(
        'Your account verification has been rejected.',
      ),
    ).toBeTruthy();

    // eslint-disable-next-line
    const deleteGa: Promise<number> = new Promise((resolve, reject) => {
      deregisterGeneticAnalyst(api, pair, () => {
        queryGeneticAnalystCount(api).then((res) => {
          resolve(res);
        });
      });
    });

    expect(await deleteGa).toEqual(0);

    dbConnection.destroy();
  }, 120000);
});
