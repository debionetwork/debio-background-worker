import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderRefundedCommand } from './order-refunded.command';
import {
  DateTimeProxy,
  NotificationService,
  TransactionLoggingService,
} from '@common/index';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import { Order } from '@debionetwork/polkadot-provider';
import { NotificationDto } from '@common/notification/dto/notification.dto';
import currencyUnit from '../../../models/currencyUnit';
import { TransactionTypeList } from '@common/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '@common/transaction-status/models/transaction-status.list';

@Injectable()
@CommandHandler(OrderRefundedCommand)
export class OrderRefundedHandler
  implements ICommandHandler<OrderRefundedCommand>
{
  private readonly logger: Logger = new Logger(OrderRefundedCommand.name);

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: OrderRefundedCommand) {
    const order: Order = command.orders;
    const blockNumber = command.blockMetaData.blockNumber.toString();
    this.logger.log(`OrderRefunded With Order ID: ${order.id}!`);

    try {
      const isOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(order.id, 4);
      const orderHistory = await this.loggingService.getLoggingByOrderId(
        order.id,
      );

      //insert logging to DB
      const orderLogging: TransactionLoggingDto = {
        address: order.customerId,
        amount:
          Number(order.prices[0].value.split(',').join('')) /
          currencyUnit[order.currency],
        created_at: this.convertToDate(order.updatedAt),
        currency: order.currency.toUpperCase(),
        parent_id: BigInt(orderHistory.id),
        ref_number: order.id,
        transaction_type: TransactionTypeList.Order,
        transaction_status: TransactionStatusList.Refunded,
      };
      if (!isOrderHasBeenInsert) {
        await this.loggingService.create(orderLogging);
      }

      const currDateTime = this.dateTimeProxy.new();

      const customerOrderRefundedNotification: NotificationDto = {
        role: 'Customer',
        entity_type: 'Genetic Testing Order',
        entity: 'Order Refunded',
        reference_id: order.dnaSampleTrackingId,
        description: `Your service fee from [] has been refunded, kindly check your account balance.`,
        read: false,
        created_at: currDateTime,
        updated_at: currDateTime,
        deleted_at: null,
        from: 'Debio Network',
        to: order.customerId,
        block_number: blockNumber,
      };
      await this.notificationService.insert(customerOrderRefundedNotification);
    } catch (error) {
      this.logger.log(error);
    }
  }

  private convertToDate(date: Date) {
    return new Date(Number(date.toString().split(',').join('')));
  }
}
