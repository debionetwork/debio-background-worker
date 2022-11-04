import {
  DateTimeProxy,
  MailerManager,
  ProcessEnvProxy,
  SubstrateService,
  TransactionLoggingService,
} from '../../../../../../../src/common';
import { OrderStatus } from '@debionetwork/polkadot-provider';
import { OrderPaidCommand } from '../../../../../../../src/listeners/substrate-listener/commands/orders';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockOrder,
  dateTimeProxyMockFactory,
  mailerManagerMockFactory,
  mockBlockNumber,
  MockType,
  notificationServiceMockFactory,
  substrateServiceMockFactory,
  transactionLoggingServiceMockFactory,
} from '../../../../../mock';
import { OrderPaidHandler } from '../../../../../../../src/listeners/substrate-listener/commands/orders/order-paid/order-paid.handler';
import { when } from 'jest-when';
import { TransactionLoggingDto } from '../../../../../../../src/common/transaction-logging/dto/transaction-logging.dto';
import { TransactionRequest } from '../../../../../../../src/common/transaction-logging/models/transaction-request.entity';
import { NotificationService } from '../../../../../../../src/common/notification/notification.service';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';

describe('Order Paid Handler Event', () => {
  let orderPaidHandler: OrderPaidHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let proceccEnvProxy: MockType<ProcessEnvProxy>; // eslint-disable-line

  const LAB_ORDER_LINK = 'http://localhost/lab/orders/';
  const POSTGRES_HOST = 'localhost';

  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['LAB_ORDER_LINK', LAB_ORDER_LINK],
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
    jest
      .useFakeTimers()
      .setSystemTime(new Date('1970-01-01T00:00:00.001Z').getTime());
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
        OrderPaidHandler,
      ],
    }).compile();

    orderPaidHandler = module.get(OrderPaidHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);

    await module.init();
  });

  it('should defined Order Paid Handler', () => {
    expect(orderPaidHandler).toBeDefined();
  });

  it('should not called logging service create', async () => {
    // Arrange
    const DATE = new Date();
    const ORDER = createMockOrder(OrderStatus.Paid, DATE);

    const RESULT_STATUS = true;
    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = DATE;
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(0).toString();
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 0;
    RESULT_TRANSACTION.transaction_hash = 'string';

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 2)
      .mockReturnValue(RESULT_STATUS);

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);

    const orderPaidCommand: OrderPaidCommand = new OrderPaidCommand(
      [ORDER],
      mockBlockNumber(),
    );

    await orderPaidHandler.execute(orderPaidCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(
      transactionLoggingServiceMock.getLoggingByOrderId,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
  });

  it('should called logging service create', async () => {
    // Arrange
    const DATE = new Date();
    const ORDER = createMockOrder(OrderStatus.Paid, DATE);

    const RESULT_STATUS = false;
    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = DATE;
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(0).toString();
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 0;
    RESULT_TRANSACTION.transaction_hash = 'string';

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 2)
      .mockReturnValue(RESULT_STATUS);

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);

    const orderPaidCommand: OrderPaidCommand = new OrderPaidCommand(
      [ORDER],
      mockBlockNumber(),
    );

    const orderLogging: TransactionLoggingDto = {
      address: orderPaidCommand.orders.customerId,
      amount: 2,
      created_at: DATE,
      currency: orderPaidCommand.orders.currency.toUpperCase(),
      parent_id: BigInt(RESULT_TRANSACTION.id),
      ref_number: orderPaidCommand.orders.id,
      transaction_status: 2,
      transaction_type: 1,
    };

    await orderPaidHandler.execute(orderPaidCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(
      transactionLoggingServiceMock.getLoggingByOrderId,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalledWith(
      orderLogging,
    );
  });
});
