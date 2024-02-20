import { ApiPromise } from '@polkadot/api';
import 'regenerator-runtime/runtime';
import {
  deregisterLab,
  stakeLab,
  unstakeLab,
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
import { TransactionRequest } from '@common/transaction-logging/models/transaction-request.entity';
import { dummyCredentials } from '../../../../config';
import { EscrowService } from '@common/escrow/escrow.service';
import { escrowServiceMockFactory } from '../../../../../unit/mock';
import {
  DateTimeModule,
  NotificationModule,
  ProcessEnvModule,
  SubstrateModule,
  TransactionLoggingModule,
} from '@common/index';
import { CqrsModule } from '@nestjs/cqrs';
import { SubstrateListenerHandler } from '@listeners/substrate-listener/substrate-listener.handler';
import { LabStakeSuccessfullHandler } from '@listeners/substrate-listener/commands/labs/stake-successfull/stake-successful.handler';
import { createConnection } from 'typeorm';
import { StakeStatus } from '@debionetwork/polkadot-provider/lib/primitives/stake-status';
import { labUnstakedHandler } from '@listeners/substrate-listener/commands/labs/unstake-successfull/unstaked-successful.handler';
import { LabUpdateVerificationStatusHandler } from '@listeners/substrate-listener/commands/labs/update-verification-status/update-verification-status.handler';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';
import { Notification } from '@common/notification/models/notification.entity';

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
        NotificationModule,
      ],
      providers: [
        {
          provide: EscrowService,
          useFactory: escrowServiceMockFactory,
        },
        SubstrateListenerHandler,
        LabStakeSuccessfullHandler,
        labUnstakedHandler,
        LabUpdateVerificationStatusHandler,
      ],
    })
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
    lab = null;
  });

  it('lab staking event', async () => {
    // eslint-disable-next-line
    const labRegisterPromise: Promise<Lab> = new Promise((resolve, reject) => {
      registerLab(api, pair, labDataMock.info, () => {
        queryLabById(api, pair.address).then((res) => {
          resolve(res);
        });
      });
    });

    lab = await labRegisterPromise;
    expect(lab.info).toEqual(labDataMock.info);

    // eslint-disable-next-line
    const labStakingPromise: Promise<Lab> = new Promise((resolve, reject) => {
      stakeLab(api, pair, () => {
        queryLabById(api, pair.address).then((res) => {
          resolve(res);
        });
      });
    });

    lab = await labStakingPromise;
    expect(lab.accountId).toEqual(pair.address);
    expect(lab.stakeStatus).toEqual(StakeStatus.Staked);

    const dbConnection = await createConnection({
      ...dummyCredentials,
      database: 'db_postgres',
      entities: [TransactionRequest],
      synchronize: true,
    });

    const labLogging = await dbConnection
      .getRepository(TransactionRequest)
      .createQueryBuilder('transaction_logs')
      .where(
        'transaction_logs.transaction_type = :transaction_type AND transaction_logs.transaction_status = :transaction_status',
        {
          transaction_type: 6,
          transaction_status: 26,
        },
      )
      .getMany();

    expect(labLogging.length).toBeGreaterThan(0);
    expect(labLogging[0].ref_number).toEqual(lab.accountId);
    expect(labLogging[0].transaction_type).toEqual(6);
    expect(labLogging[0].transaction_status).toEqual(26);

    await dbConnection.destroy();
  }, 180000);

  it('lab unstaking event', async () => {
    // eslint-disable-next-line
    const labPromise: Promise<Lab> = new Promise((resolve, reject) => {
      queryLabById(api, pair.address).then((res) => {
        resolve(res);
      });
    });

    lab = await labPromise;
    expect(lab.stakeStatus).toEqual('Staked');

    // eslint-disable-next-line
    const unstakedLabPromise: Promise<Lab> = new Promise((resolve, reject) => {
      unstakeLab(api, pair, () => {
        queryLabById(api, pair.address).then((res) => {
          resolve(res);
        });
      });
    });

    lab = await unstakedLabPromise;
    expect(lab.stakeStatus).toEqual('WaitingForUnstaked');

    const dbConnection = await createConnection({
      ...dummyCredentials,
      database: 'db_postgres',
      entities: [TransactionRequest],
      synchronize: true,
    });

    const transactionLogs = await dbConnection
      .getRepository(TransactionRequest)
      .createQueryBuilder('transaction_logs')
      .where(
        'transaction_logs.transaction_type = :transaction_type AND transaction_logs.transaction_status = :transaction_status',
        {
          transaction_type: 6,
          transaction_status: 27,
        },
      )
      .getMany();

    expect(transactionLogs[0].ref_number).toEqual(lab.accountId);
    expect(transactionLogs[0].transaction_type).toEqual(6);
    expect(transactionLogs[0].transaction_status).toEqual(27);

    await dbConnection.destroy();
  }, 180000);

  it('change lab status lab event', async () => {
    const registerVerifiedLabPromise: Promise<Lab> = new Promise(
      // eslint-disable-next-line
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
      entities: [Notification],
      synchronize: true,
    });

    const notificationsVerification = await dbConnection
      .getRepository(Notification)
      .createQueryBuilder('notification')
      .where(
        'notification.to = :to AND notification.entity = :entity AND notification.role = :role',
        {
          to: lab.accountId,
          entity: 'Account Verified',
          role: 'Lab',
        },
      )
      .getMany();

    expect(notificationsVerification.length).toEqual(1);
    expect(notificationsVerification[0].to).toEqual(lab.accountId);
    expect(notificationsVerification[0].entity).toEqual('Account Verified');
    expect(
      notificationsVerification[0].description.includes(
        'Congrats! Your account has been verified.',
      ),
    ).toBeTruthy();

    const registerResolveLabPromise: Promise<Lab> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        updateLabVerificationStatus(
          api,
          pair,
          pair.address,
          VerificationStatus.Revoked,
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

    const notificationsRevoke = await dbConnection
      .getRepository(Notification)
      .createQueryBuilder('notification')
      .where(
        'notification.to = :to AND notification.entity = :entity AND notification.role = :role',
        {
          to: lab.accountId,
          entity: 'Account Revoked',
          role: 'Lab',
        },
      )
      .getMany();

    expect(notificationsRevoke.length).toEqual(1);
    expect(notificationsRevoke[0].to).toEqual(lab.accountId);
    expect(notificationsRevoke[0].entity).toEqual('Account Revoked');
    expect(
      notificationsRevoke[0].description.includes(
        'Your account has been revoked.',
      ),
    ).toBeTruthy();

    const registerRejectLabPromise: Promise<Lab> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        updateLabVerificationStatus(
          api,
          pair,
          pair.address,
          VerificationStatus.Rejected,
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

    const notificationsRejected = await dbConnection
      .getRepository(Notification)
      .createQueryBuilder('notification')
      .where(
        'notification.to = :to AND notification.entity = :entity AND notification.role = :role',
        {
          to: lab.accountId,
          entity: 'Account Rejected',
          role: 'Lab',
        },
      )
      .getMany();

    expect(notificationsRejected.length).toEqual(1);
    expect(notificationsRejected[0].to).toEqual(lab.accountId);
    expect(notificationsRejected[0].entity).toEqual('Account Rejected');
    expect(
      notificationsRejected[0].description.includes(
        'Your account verification has been rejected.',
      ),
    ).toBeTruthy();

    await deregisterLab(api, pair);
    await dbConnection.destroy();
  }, 120000);
});
