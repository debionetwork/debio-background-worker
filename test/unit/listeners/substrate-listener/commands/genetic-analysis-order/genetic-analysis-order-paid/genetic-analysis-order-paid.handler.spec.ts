import {
  DateTimeProxy,
  MailerManager,
  ProcessEnvProxy,
  SubstrateService,
  TransactionLoggingService,
} from '@common/index';
import { GeneticAnalysisOrderStatus } from '@debionetwork/polkadot-provider';
import { GeneticAnalysisOrderPaidCommand } from '@listeners/substrate-listener/commands/genetic-analysis-order';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockGeneticAnalysisOrder,
  dateTimeProxyMockFactory,
  mailerManagerMockFactory,
  mockBlockNumber,
  MockType,
  notificationServiceMockFactory,
  substrateServiceMockFactory,
  transactionLoggingServiceMockFactory,
} from '../../../../../mock';
import { GeneticAnalysisOrderPaidHandler } from '@listeners/substrate-listener/commands/genetic-analysis-order/genetic-analysis-order-paid/genetic-analysis-order-paid.handler';
import { when } from 'jest-when';
import { NotificationService } from '@common/notification/notification.service';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';

describe('Genetic Analysis Order Paid Handler Event', () => {
  let geneticAnalysisOrderPaidHandler: GeneticAnalysisOrderPaidHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let notificationServiceMock: MockType<NotificationService>;
  let proceccEnvProxy: MockType<ProcessEnvProxy>; // eslint-disable-line

  const GA_ORDER_LINK = 'http://localhost/lab/orders/';
  const POSTGRES_HOST = 'localhost';

  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['GA_ORDER_LINK', GA_ORDER_LINK],
      ['POSTGRES_HOST', POSTGRES_HOST],
    ]);
    loadSecrets() {
      return null;
    }

    getSecret(key) {
      return this._secretsList.get(key);
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory,
        },
        {
          provide: NotificationService,
          useFactory: notificationServiceMockFactory,
        },
        {
          provide: DateTimeProxy,
          useFactory: dateTimeProxyMockFactory,
        },
        {
          provide: MailerManager,
          useFactory: mailerManagerMockFactory,
        },
        {
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory,
        },
        {
          provide: GCloudSecretManagerService,
          useClass: GoogleSecretManagerServiceMock,
        },
        GeneticAnalysisOrderPaidHandler,
      ],
    }).compile();

    geneticAnalysisOrderPaidHandler = module.get(
      GeneticAnalysisOrderPaidHandler,
    );
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    notificationServiceMock = module.get(NotificationService);

    await module.init();
  });

  it('should defined GA Order Paid Handler', () => {
    expect(geneticAnalysisOrderPaidHandler).toBeDefined();
  });

  it('should not called logging service paid', async () => {
    // Arrange
    const GA_ORDER = createMockGeneticAnalysisOrder(
      GeneticAnalysisOrderStatus.Paid,
    );

    const RESULT_STATUS = true;

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(GA_ORDER.toHuman().id, 14)
      .mockReturnValue(RESULT_STATUS);

    const geneticAnalysisOrders: GeneticAnalysisOrderPaidCommand =
      new GeneticAnalysisOrderPaidCommand([GA_ORDER], mockBlockNumber());

    await geneticAnalysisOrderPaidHandler.execute(geneticAnalysisOrders);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
    expect(notificationServiceMock.insert).toHaveBeenCalled();
  });

  it('should called logging service paid', async () => {
    // Arrange
    const GA_ORDER = createMockGeneticAnalysisOrder(
      GeneticAnalysisOrderStatus.Paid,
    );

    const RESULT_STATUS = { id: 1 };

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(GA_ORDER.toHuman().id, 14)
      .mockReturnValue(RESULT_STATUS);

    const geneticAnalysisOrderPaidCommand: GeneticAnalysisOrderPaidCommand =
      new GeneticAnalysisOrderPaidCommand([GA_ORDER], mockBlockNumber());

    await geneticAnalysisOrderPaidHandler.execute(
      geneticAnalysisOrderPaidCommand,
    );
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(notificationServiceMock.insert).toHaveBeenCalled();
  });
});
