import 'regenerator-runtime/runtime';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import {
  EmailNotification,
  EmailNotificationModule,
  EmailNotificationService,
} from '@common/database';
import {
  SubstrateModule,
  MailModule,
  MailerManager,
  ProcessEnvModule,
} from '@common/index';
import { MailerService } from '@schedulers/mailer/mailer.service';
import { Keyring } from '@polkadot/api';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dummyCredentials } from '../config';
import { SubstrateService } from '@common/substrate/substrate.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { config } from '../../../src/config';

describe('Mailer Scheduler (e2e)', () => {
  let service: MailerService;
  let mailerManager: MailerManager;
  let substrateService: SubstrateService;
  let emailNotificationService: EmailNotificationService;

  let app: INestApplication;

  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  class GoogleSecretManagerServiceMock {
    async accessSecret() {
      return null;
    }
    _secretsList = new Map<string, string>([
      ['POSTGRES_HOST', 'localhost'],
      ['SUBSTRATE_URL', process.env.SUBSTRATE_URL],
      ['ELASTICSEARCH_NODE', process.env.ELASTICSEARCH_NODE],
      ['ELASTICSEARCH_USERNAME', process.env.ELASTICSEARCH_USERNAME],
      ['ELASTICSEARCH_PASSWORD', process.env.ELASTICSEARCH_PASSWORD],
      ['ADMIN_SUBSTRATE_MNEMONIC', process.env.ADMIN_SUBSTRATE_MNEMONIC],
      ['SUBSTRATE_URL', process.env.SUBSTRATE_URL],
      ['EMAIL', process.env.EMAIL],
      ['PASS_EMAIL', process.env.PASS_EMAIL],
      ['UNSTAKE_TIMER', process.env.UNSTAKE_TIMER],
      ['UNSTAKE_INTERVAL', process.env.UNSTAKE_INTERVAL],
      ['EMAILS', process.env.EMAILS],
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
        ProcessEnvModule,
        ElasticsearchModule.registerAsync({
          inject: [],
          useFactory: async (
          ) => ({
            node: process.env.ELASTICSEARCH_NODE,
            auth: {
              username: config.ELASTICSEARCH_USERNAME.toString(),
              password: config.ELASTICSEARCH_PASSWORD.toString(),
            },
          }),
        }),
        TypeOrmModule.forRoot({
          name: 'default',
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [EmailNotification],
          autoLoadEntities: true,
        }),
        SubstrateModule,
        MailModule,
        EmailNotificationModule,
      ],
    })
      .compile();

    mailerManager = module.get(MailerManager);
    substrateService = module.get(SubstrateService);
    emailNotificationService = module.get(EmailNotificationService);

    service = new MailerService(
      mailerManager,
      emailNotificationService,
      substrateService,
    );

    app = module.createNestApplication();
    await app.init();
  }, 25000);

  afterAll(async () => {
    await substrateService.stopListen();
    substrateService.destroy();
    await app.close();
  });

  it('handlePendingLabRegister should not throw', async () => {
    // Arrange
    const sendLabRegistrationEmailSpy = jest.spyOn(
      mailerManager,
      'sendLabRegistrationEmail',
    );
    const setEmailNotificationSentSpy = jest.spyOn(
      emailNotificationService,
      'setEmailNotificationSent',
    );
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = await keyring.addFromUri('//Alice', { name: 'Alice default' });

    // Act
    await service.handlePendingLabRegister();

    await substrateService.stopListen();

    // Assert
    expect(sendLabRegistrationEmailSpy).toBeCalledTimes(1);
    expect(setEmailNotificationSentSpy).toBeCalledTimes(1);
    expect(setEmailNotificationSentSpy).toBeCalledWith(pair.address);
  }, 25000);
});
