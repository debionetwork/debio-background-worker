import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Option } from '@polkadot/types';
import { OrderFulfilledCommand } from './order-fulfilled.command';
import {
  DateTimeProxy,
  NotificationService,
  SubstrateService,
  TransactionLoggingService,
} from '../../../../../common';
import {
  Order,
  queryEthAdressByAccountId,
} from '@debionetwork/polkadot-provider';
import { EscrowService } from '../../../../../common/escrow/escrow.service';
import { TransactionLoggingDto } from '../../../../../common/transaction-logging/dto/transaction-logging.dto';
import { NotificationDto } from '../../../../../common/notification/dto/notification.dto';

@Injectable()
@CommandHandler(OrderFulfilledCommand)
export class OrderFulfilledHandler
  implements ICommandHandler<OrderFulfilledCommand>
{
  private readonly logger: Logger = new Logger(OrderFulfilledCommand.name);

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly escrowService: EscrowService,
    private readonly substrateService: SubstrateService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: OrderFulfilledCommand) {
    const order: Order = command.orders.normalize();
    const blockNumber = command.blockMetaData.blockNumber.toString();
    this.logger.log(`Order Fulfilled With Order ID: ${order.id}!`);

    try {
      const isOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(order.id, 3);

      const orderHistory = await this.loggingService.getLoggingByOrderId(
        order.id,
      );
      // Logging data input
      const orderLogging: TransactionLoggingDto = {
        address: order.customerId,
        amount: +order.additionalPrices[0].value + +order.prices[0].value,
        created_at: order.updatedAt,
        currency: order.currency.toUpperCase(),
        parent_id: orderHistory?.id ? BigInt(orderHistory.id) : BigInt(0),
        ref_number: order.id,
        transaction_status: 3,
        transaction_type: 1,
      };

      // Logging transaction
      if (isOrderHasBeenInsert) {
        return;
      }
      const labEthAddress: any = await queryEthAdressByAccountId(
        this.substrateService.api as any,
        order['sellerId'],
      );

      if ((labEthAddress as Option<any>).isNone) {
        await this.logger.log(
          `Eth address by account id: ${order.customerId} is none!`,
        );
        return null;
      }

      const totalPrice = order.prices.reduce(
        (acc, price) => acc + +price.value,
        0,
      );
      const totalAdditionalPrice = order.additionalPrices.reduce(
        (acc, price) => acc + +price.value,
        0,
      );
      const amountToForward = totalPrice + totalAdditionalPrice;

      await this.escrowService.orderFulfilled(order);
      await this.loggingService.create(orderLogging);

      const currDateTime = this.dateTimeProxy.new();

      // Write Logging Notification Customer Reward From Request Service
      const labPaymentNotification: NotificationDto = {
        role: 'Lab',
        entity_type: 'Genetic Testing Order',
        entity: 'Order Fulfilled',
        description: `You've received ${amountToForward} DAI for completeing the requested test for ${order.id}.`,
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
    }
  }

  callbackInsertNotificationLogging(data: NotificationDto) {
    this.notificationService.insert(data);
  }
}
