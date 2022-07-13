import {
  GeneticAnalyst,
  queryGeneticAnalystByAccountId,
  registerGeneticAnalyst,
  stakeGeneticAnalyst,
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
} from '../../../../../../src/common';
import { EscrowService } from '../../../../../../src/common/escrow/escrow.service';
import { TransactionRequest } from '../../../../../../src/common/transaction-logging/models/transaction-request.entity';
import { LabRating } from '../../../../../mock/models/rating/rating.entity';
import { SubstrateListenerHandler } from '../../../../../../src/listeners/substrate-listener/substrate-listener.handler';
import { dummyCredentials } from '../../../../../e2e/config';
import { escrowServiceMockFactory } from '../../../../../unit/mock';
import { initializeApi } from '../../../../../e2e/polkadot-init';
import { geneticAnalystsDataMock } from '../../../../../mock/models/genetic-analysts/genetic-analysts.mock';
import { Notification } from '../../../../../../src/common/notification/models/notification.entity';
import { createConnection } from 'typeorm';
import { StakeStatus } from '@debionetwork/polkadot-provider/lib/primitives/stake-status';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { GeneticAnalystRegisteredHandler } from '../../../../../../src/listeners/substrate-listener/commands/genetic-analysts/genetic-analyst-registered/genetic-analyst-registered.handler';

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
        GCloudSecretManagerModule.withConfig(process.env.PARENT),
        TypeOrmModule.forRoot({
          type: 'postgres',
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [LabRating, TransactionRequest],
          autoLoadEntities: true,
        }),
        ProcessEnvModule,
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
        GeneticAnalystRegisteredHandler,
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

  it('genetic analyst registered event', async () => {
    const geneticAnalystPromise: Promise<GeneticAnalyst> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        registerGeneticAnalyst(api, pair, geneticAnalystsDataMock.info, () => {
          stakeGeneticAnalyst(api, pair, () => {
            queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
              resolve(res);
            });
          });
        });
      },
    );

    const ga: GeneticAnalyst = await geneticAnalystPromise;

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

    expect(ga.stakeStatus).toEqual(StakeStatus.Staked);

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
          to: ga.accountId,
          entity: 'registration and verification',
          role: 'GA',
        },
      )
      .getMany();

    expect(notifications.length).toEqual(1);
    expect(notifications[0].to).toEqual(ga.accountId);
    expect(notifications[0].entity).toEqual('registration and verification');
    expect(
      notifications[0].description.includes(
        `You've successfully submitted your account verification.`,
      ),
    ).toBeTruthy();
  }, 180000);
});
