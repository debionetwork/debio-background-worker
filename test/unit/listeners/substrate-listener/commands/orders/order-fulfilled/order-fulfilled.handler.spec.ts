import {
  DateTimeProxy,
  SubstrateService,
  TransactionLoggingService,
} from '../../../../../../../src/common';
import { OrderStatus } from '@debionetwork/polkadot-provider';
import { OrderCreatedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/orders';
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
import { OrderFulfilledHandler } from '../../../../../../../src/listeners/substrate-listener/commands/orders/order-fulfilled/order-fulfilled.handler';
import { EscrowService } from '../../../../../../../src/common/escrow/escrow.service';
import { NotificationService } from '../../../../../../../src/common/notification/notification.service';
import { when } from 'jest-when';
import { TransactionLoggingDto } from '../../../../../../../src/common/transaction-logging/dto/transaction-logging.dto';
import { TransactionRequest } from '../../../../../../../src/common/transaction-logging/models/transaction-request.entity';

import * as userProfileQuery from '@debionetwork/polkadot-provider/lib/query/user-profile';
import * as ordersQuery from '@debionetwork/polkadot-provider/lib/query/labs/orders';
import * as servicesQuery from '@debionetwork/polkadot-provider/lib/query/labs/services';

describe('Order Fulfilled Handler Event', () => {
  let orderFulfilledHandler: OrderFulfilledHandler;
  let substrateServiceMock: MockType<SubstrateService>;
  let escrowServiceMock: MockType<EscrowService>;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let notificationServiceMock: MockType<NotificationService>;
  let dateTimeProxyMock: MockType<DateTimeProxy>;

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
          provide: EscrowService,
          useFactory: escrowServiceMockFactory,
        },
        {
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory,
        },
        {
          provide: NotificationService,
          useFactory: notificationServiceMockFactory,
        },
        {
          provide: DateTimeProxy,
          useFactory: dateTimeProxyMockFactory,
        },
        OrderFulfilledHandler,
      ],
    }).compile();

    orderFulfilledHandler = module.get(OrderFulfilledHandler);
    substrateServiceMock = module.get(SubstrateService);
    escrowServiceMock = module.get(EscrowService);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    notificationServiceMock = module.get(NotificationService); // eslint-disable-line
    dateTimeProxyMock = module.get(DateTimeProxy); // eslint-disable-line

    await module.init();
  });

  it('should defined Order Fulfilled Handler', () => {
    expect(orderFulfilledHandler).toBeDefined();
  });

  it('should not called logging service create', async () => {
    // Arrange
    const queryEthAdressByAccountIdSpy = jest
      .spyOn(userProfileQuery, 'queryEthAdressByAccountId')
      .mockImplementation();
    const queryOrderDetailByOrderIDSpy = jest
      .spyOn(ordersQuery, 'queryOrderDetailByOrderID')
      .mockImplementation();
    const queryServiceByIdSpy = jest
      .spyOn(servicesQuery, 'queryServiceById')
      .mockImplementation();
    const ORDER = createMockOrder(OrderStatus.Cancelled);

    const RESULT_STATUS = true;

    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = new Date();
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(0).toString();
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 3;
    RESULT_TRANSACTION.transaction_hash = 'string';

    const SERVICE_RETURN = {
      serviceFlow: 'StakingRequestService',
    };

    const ORDER_DETAIL = {
      orderFlow: 'StakingRequestService',
    };

    const ETH_ADDRESS_ACCOUNT_ID_RETURN = {
      isNone: false,
      unwrap: () => ({
        toString: () => 'string',
      }),
    };

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 3)
      .mockReturnValue(RESULT_STATUS);

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);

    when(queryEthAdressByAccountIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().sellerId)
      .mockReturnValue(ETH_ADDRESS_ACCOUNT_ID_RETURN);

    when(queryOrderDetailByOrderIDSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().id)
      .mockReturnValue(ORDER_DETAIL);

    when(queryServiceByIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().serviceId)
      .mockReturnValue(SERVICE_RETURN);

    const orderCancelledCommand: OrderCreatedCommand = new OrderCreatedCommand(
      [ORDER],
      mockBlockNumber(),
    );

    await orderFulfilledHandler.execute(orderCancelledCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(
      transactionLoggingServiceMock.getLoggingByOrderId,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
    expect(queryEthAdressByAccountIdSpy).not.toHaveBeenCalled();
    expect(queryEthAdressByAccountIdSpy).not.toHaveBeenCalledWith(
      substrateServiceMock.api,
      ORDER.toHuman().sellerId,
    );
    expect(queryOrderDetailByOrderIDSpy).not.toHaveBeenCalled();
    expect(queryServiceByIdSpy).not.toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
    expect(escrowServiceMock.orderFulfilled).not.toHaveBeenCalled();
    expect(escrowServiceMock.forwardPaymentToSeller).not.toHaveBeenCalled();

    queryEthAdressByAccountIdSpy.mockClear();
    queryOrderDetailByOrderIDSpy.mockClear();
    queryServiceByIdSpy.mockClear();
  });

  it('should called logging service create', async () => {
    // Arrange
    const queryEthAdressByAccountIdSpy = jest
      .spyOn(userProfileQuery, 'queryEthAdressByAccountId')
      .mockImplementation();
    const ORDER = createMockOrder(OrderStatus.Cancelled);

    const RESULT_STATUS = false;

    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = new Date();
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(0).toString();
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 3;
    RESULT_TRANSACTION.transaction_hash = 'string';

    const ETH_ADDRESS_ACCOUNT_ID_RETURN = {
      isNone: false,
      unwrap: () => ({
        toString: () => 'string',
      }),
    };

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 3)
      .mockReturnValue(RESULT_STATUS);

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);

    when(queryEthAdressByAccountIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().sellerId)
      .mockReturnValue(ETH_ADDRESS_ACCOUNT_ID_RETURN);

    const orderCancelledCommand: OrderCreatedCommand = new OrderCreatedCommand(
      [ORDER],
      mockBlockNumber(),
    );

    const ORDER_LOGGING_CALLED_WITH: TransactionLoggingDto = {
      address: orderCancelledCommand.orders.customerId,
      amount:
        Number(orderCancelledCommand.orders.additionalPrices[0].value) /
          10 ** 18 +
        Number(orderCancelledCommand.orders.prices[0].value) / 10 ** 18,
      created_at: new Date(),
      currency: orderCancelledCommand.orders.currency.toUpperCase(),
      parent_id: BigInt(RESULT_TRANSACTION.id),
      ref_number: orderCancelledCommand.orders.id,
      transaction_status: 3,
      transaction_type: 1,
    };

    await orderFulfilledHandler.execute(orderCancelledCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(
      transactionLoggingServiceMock.getLoggingByOrderId,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalledWith(
      ORDER_LOGGING_CALLED_WITH,
    );
    expect(queryEthAdressByAccountIdSpy).toHaveBeenCalled();
    expect(queryEthAdressByAccountIdSpy).toHaveBeenCalledWith(
      substrateServiceMock.api,
      ORDER.toHuman().sellerId,
    );
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalledTimes(1);
    expect(escrowServiceMock.orderFulfilled).toHaveBeenCalled();
    expect(escrowServiceMock.forwardPaymentToSeller).not.toHaveBeenCalled();

    queryEthAdressByAccountIdSpy.mockClear();
  });

  it('when eth address isNone true', async () => {
    // Arrange
    const queryEthAdressByAccountIdSpy = jest
      .spyOn(userProfileQuery, 'queryEthAdressByAccountId')
      .mockImplementation();
    const queryOrderDetailByOrderIDSpy = jest
      .spyOn(ordersQuery, 'queryOrderDetailByOrderID')
      .mockImplementation();
    const queryServiceByIdSpy = jest
      .spyOn(servicesQuery, 'queryServiceById')
      .mockImplementation();
    const ORDER = createMockOrder(OrderStatus.Cancelled);

    const RESULT_STATUS = false;

    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = new Date();
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(0).toString();
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 3;
    RESULT_TRANSACTION.transaction_hash = 'string';

    const SERVICE_RETURN = {
      serviceFlow: 'StakingRequestService',
    };

    const ORDER_DETAIL = {
      orderFlow: 'StakingRequestService',
    };

    const ETH_ADDRESS_ACCOUNT_ID_RETURN = {
      isNone: true,
      unwrap: () => ({
        toString: () => 'string',
      }),
    };

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 3)
      .mockReturnValue(RESULT_STATUS);

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);

    when(queryEthAdressByAccountIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().sellerId)
      .mockReturnValue(ETH_ADDRESS_ACCOUNT_ID_RETURN);

    when(queryOrderDetailByOrderIDSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().id)
      .mockReturnValue(ORDER_DETAIL);

    when(queryServiceByIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().serviceId)
      .mockReturnValue(SERVICE_RETURN);

    const orderCancelledCommand: OrderCreatedCommand = new OrderCreatedCommand(
      [ORDER],
      mockBlockNumber(),
    );

    const ORDER_LOGGING_CALLED_WITH: TransactionLoggingDto = {
      address: orderCancelledCommand.orders.customerId,
      amount:
        Number(orderCancelledCommand.orders.additionalPrices[0].value) /
          10 ** 18 +
        Number(orderCancelledCommand.orders.prices[0].value) / 10 ** 18,
      created_at: new Date(),
      currency: orderCancelledCommand.orders.currency.toUpperCase(),
      parent_id: BigInt(RESULT_TRANSACTION.id),
      ref_number: orderCancelledCommand.orders.id,
      transaction_status: 3,
      transaction_type: 1,
    };

    await orderFulfilledHandler.execute(orderCancelledCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(
      transactionLoggingServiceMock.getLoggingByOrderId,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalledWith(
      ORDER_LOGGING_CALLED_WITH,
    );
    expect(queryEthAdressByAccountIdSpy).toHaveBeenCalled();
    expect(queryEthAdressByAccountIdSpy).toHaveBeenCalledWith(
      substrateServiceMock.api,
      ORDER.toHuman().sellerId,
    );
    expect(queryOrderDetailByOrderIDSpy).not.toHaveBeenCalled();
    expect(queryServiceByIdSpy).not.toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalledTimes(2);
    expect(escrowServiceMock.orderFulfilled).not.toHaveBeenCalled();
    expect(escrowServiceMock.forwardPaymentToSeller).not.toHaveBeenCalled();

    queryEthAdressByAccountIdSpy.mockClear();
    queryOrderDetailByOrderIDSpy.mockClear();
    queryServiceByIdSpy.mockClear();
  });

  it('when order and service flow is not StakingRequestService', async () => {
    // Arrange
    const queryEthAdressByAccountIdSpy = jest
      .spyOn(userProfileQuery, 'queryEthAdressByAccountId')
      .mockImplementation();
    const queryOrderDetailByOrderIDSpy = jest
      .spyOn(ordersQuery, 'queryOrderDetailByOrderID')
      .mockImplementation();
    const queryServiceByIdSpy = jest
      .spyOn(servicesQuery, 'queryServiceById')
      .mockImplementation();
    const ORDER = createMockOrder(OrderStatus.Cancelled);

    const RESULT_STATUS = true;

    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = new Date();
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(0).toString();
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 3;
    RESULT_TRANSACTION.transaction_hash = 'string';

    const SERVICE_RETURN = {
      serviceFlow: '',
    };

    const ORDER_DETAIL = {
      orderFlow: '',
    };

    const ETH_ADDRESS_ACCOUNT_ID_RETURN = {
      isNone: false,
      unwrap: () => ({
        toString: () => 'string',
      }),
    };

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 3)
      .mockReturnValue(RESULT_STATUS);

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);

    when(queryEthAdressByAccountIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().sellerId)
      .mockReturnValue(ETH_ADDRESS_ACCOUNT_ID_RETURN);

    when(queryOrderDetailByOrderIDSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().id)
      .mockReturnValue(ORDER_DETAIL);

    when(queryServiceByIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().serviceId)
      .mockReturnValue(SERVICE_RETURN);

    const orderCancelledCommand: OrderCreatedCommand = new OrderCreatedCommand(
      [ORDER],
      mockBlockNumber(),
    );

    await orderFulfilledHandler.execute(orderCancelledCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(
      transactionLoggingServiceMock.getLoggingByOrderId,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
    // expect(queryEthAdressByAccountIdSpy).toHaveBeenCalledTimes(1);
    // expect(queryEthAdressByAccountIdSpy).toHaveBeenCalledWith(
    //   substrateServiceMock.api,
    //   ORDER.toHuman().sellerId,
    // );
    expect(queryOrderDetailByOrderIDSpy).not.toHaveBeenCalled();
    expect(queryServiceByIdSpy).not.toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalledTimes(2);
    expect(escrowServiceMock.orderFulfilled).not.toHaveBeenCalled();
    expect(escrowServiceMock.forwardPaymentToSeller).not.toHaveBeenCalled();

    queryEthAdressByAccountIdSpy.mockClear();
    queryOrderDetailByOrderIDSpy.mockClear();
    queryServiceByIdSpy.mockClear();
  });
});
