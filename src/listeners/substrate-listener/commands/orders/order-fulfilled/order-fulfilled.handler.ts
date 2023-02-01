import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Option } from '@polkadot/types';
import { OrderFulfilledCommand } from './order-fulfilled.command';
import {
  DateTimeProxy,
  NotificationService,
  SubstrateService,
  TransactionLoggingService,
} from '@common/index';
import {
  Order,
  queryEthAdressByAccountId,
} from '@debionetwork/polkadot-provider';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import { NotificationDto } from '@common/notification/dto/notification.dto';
import currencyUnit from '../../../models/currencyUnit';
import { TransactionTypeList } from '@common/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '@common/transaction-status/models/transaction-status.list';

@Injectable()
@CommandHandler(OrderFulfilledCommand)
export class OrderFulfilledHandler
  implements ICommandHandler<OrderFulfilledCommand>
{
  private readonly logger: Logger = new Logger(OrderFulfilledCommand.name);

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly substrateService: SubstrateService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: OrderFulfilledCommand) {
    const order: Order = command.orders;
    const blockNumber = command.blockMetaData.blockNumber.toString();
    this.logger.log(`Order Fulfilled With Order ID: ${order.id}!`);

    try {
      const isOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(order.id, 3);

      const orderHistory = await this.loggingService.getLoggingByOrderId(
        order.id,
      );

      const totalPrice = order.prices.reduce(
        (acc, price) => acc + Number(price.value.split(',').join('')),
        0,
      );
      const totalAdditionalPrice = order.additionalPrices.reduce(
        (acc, price) => acc + Number(price.value.split(',').join('')),
        0,
      );

      const amountToForward = totalPrice + totalAdditionalPrice;

      // Logging data input
      const orderLogging: TransactionLoggingDto = {
        address: order.customerId,
        amount: amountToForward / currencyUnit[order.currency],
        created_at: this.convertToDate(order.updatedAt),
        currency: order.currency.toUpperCase(),
        parent_id: orderHistory?.id ? BigInt(orderHistory.id) : BigInt(0),
        ref_number: order.id,
        transaction_type: TransactionTypeList.Order,
        transaction_status: TransactionStatusList.Fulfilled,
      };

      // Logging transaction
      if (isOrderHasBeenInsert) {
        await this.loggingService.updateHash(
          isOrderHasBeenInsert,
          command.blockMetaData.blockHash,
        );
        return;
      }

      const labEthAddress: any = await queryEthAdressByAccountId(
        this.substrateService.api as any,
        order['sellerId'],
      );

      if ((labEthAddress as Option<any>).isNone) {
        this.logger.log(
          `Eth address by account id: ${order.customerId} is none!`,
        );
        return null;
      }

      await this.loggingService.create(orderLogging);

      const currDateTime = this.dateTimeProxy.new();

      // Write Logging Notification Customer Reward From Request Service
      const labPaymentNotification: NotificationDto = {
        role: 'Lab',
        entity_type: 'Genetic Testing Order',
        entity: 'Order Fulfilled',
        reference_id: order.dnaSampleTrackingId,
        description: `You've received ${
          amountToForward / currencyUnit[order.currency]
        } ${order.currency} for completeing the requested test for [].`,
        read: false,
        created_at: currDateTime,
        updated_at: currDateTime,
        deleted_at: null,
        from: 'Debio Network',
        to: order.sellerId,
        block_number: blockNumber,
      };

      await this.notificationService.insert(labPaymentNotification);

      this.logger.log('OrderFulfilled Event');
      this.logger.log(`labEthAddress: ${labEthAddress}`);
      this.logger.log(`amountToForward: ${amountToForward}`);
    } catch (err) {
      this.logger.log(err);
      this.logger.log(`Forward payment failed | err -> ${err}`);
      console.log(err);
    }
  }

  private convertToDate(date: Date) {
    return new Date(Number(date.toString().split(',').join('')));
  }
}
