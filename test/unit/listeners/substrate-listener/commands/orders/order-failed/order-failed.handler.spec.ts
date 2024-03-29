import {
  DateTimeProxy,
  SubstrateService,
  TransactionLoggingService,
} from '@common/index';
import { OrderCreatedCommand } from '@listeners/substrate-listener/commands/orders';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockOrder,
  dateTimeProxyMockFactory,
  escrowServiceMockFactory,
  mockBlockNumber,
  MockType,
  notificationServiceMockFactory,
  substrateServiceMockFactory,
  transactionLoggingServiceMockFactory,
} from '../../../../../mock';
import { OrderStatus } from '@debionetwork/polkadot-provider';
import { OrderFailedHandler } from '@listeners/substrate-listener/commands/orders/order-failed/order-failed.handler';
import { EscrowService } from '@common/escrow/escrow.service';
import * as ordersCommand from '@debionetwork/polkadot-provider/lib/command/labs/orders';
import { NotificationService } from '@common/notification/notification.service';

describe('Order Failed Handler Event', () => {
  let orderFailedHandler: OrderFailedHandler;
  let transactionLoggingService: MockType<TransactionLoggingService>;
  let substrateServiceMock: MockType<SubstrateService>;
  let escrowServiceMock: MockType<EscrowService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory,
        },
        {
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory,
        },
        {
          provide: EscrowService,
          useFactory: escrowServiceMockFactory,
        },
        {
          provide: NotificationService,
          useFactory: notificationServiceMockFactory,
        },
        {
          provide: DateTimeProxy,
          useFactory: dateTimeProxyMockFactory,
        },
        OrderFailedHandler,
      ],
    }).compile();

    orderFailedHandler = module.get(OrderFailedHandler);
    transactionLoggingService = module.get(TransactionLoggingService);
    substrateServiceMock = module.get(SubstrateService);
    escrowServiceMock = module.get(EscrowService);

    await module.init();
  });

  it('should defined Order Failed Handler', () => {
    expect(orderFailedHandler).toBeDefined();
  });

  it('should called refunded order if failed', async () => {
    // Arrange
    const refundedOrderSpy = jest
      .spyOn(ordersCommand, 'setOrderRefunded')
      .mockImplementation();
    const ORDER = createMockOrder(OrderStatus.Failed, 'XX');

    const orderFailedCommand: OrderCreatedCommand = new OrderCreatedCommand(
      [ORDER],
      mockBlockNumber(),
    );

    await orderFailedHandler.execute(orderFailedCommand);
    expect(transactionLoggingService.getLoggingByHashAndStatus).toBeCalled();
    expect(escrowServiceMock.refundOrder).toHaveBeenCalled();
    expect(escrowServiceMock.refundOrder).toHaveBeenCalledWith(
      orderFailedCommand.orders,
    );
    expect(refundedOrderSpy).toHaveBeenCalled();
    expect(refundedOrderSpy).toHaveBeenCalledWith(
      substrateServiceMock.api,
      substrateServiceMock.pair,
      orderFailedCommand.orders.id,
    );
  });
});
