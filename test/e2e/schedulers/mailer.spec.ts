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

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ProcessEnvModule,
        ElasticsearchModule.registerAsync({
          inject: [],
          useFactory: async () => ({
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
    }).compile();

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
