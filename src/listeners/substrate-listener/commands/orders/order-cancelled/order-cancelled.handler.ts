import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderCancelledCommand } from './order-cancelled.command';
import { TransactionLoggingService } from '@common/index';
import { EscrowService } from '@common/escrow/escrow.service';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import { Order } from '@debionetwork/polkadot-provider';
import { TransactionTypeList } from '@common/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '@common/transaction-status/models/transaction-status.list';

@Injectable()
@CommandHandler(OrderCancelledCommand)
export class OrderCancelledHandler
  implements ICommandHandler<OrderCancelledCommand>
{
  private readonly logger: Logger = new Logger(OrderCancelledCommand.name);

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly escrowService: EscrowService,
  ) {}

  async execute(command: OrderCancelledCommand) {
    const order: Order = command.orders.normalize();
    this.logger.log(`OrderCancelled With Order ID: ${order.id}!`);

    try {
      const isOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(order.id, 5);

      const orderHistory = await this.loggingService.getLoggingByOrderId(
        order.id,
      );
      //Logging data Input
      const orderLogging: TransactionLoggingDto = {
        address: order.customerId,
        amount: +order.additionalPrices[0].value + +order.prices[0].value,
        created_at: order.updatedAt,
        currency: order.currency.toUpperCase(),
        parent_id: BigInt(orderHistory.id),
        ref_number: order.id,
        transaction_type: TransactionTypeList.Order,
        transaction_status: TransactionStatusList.Cancelled,
      };
      await this.escrowService.cancelOrder(order);
      if (!isOrderHasBeenInsert) {
        await this.loggingService.create(orderLogging);
      }
    } catch (error) {
      this.logger.log(error);
    }
  }
}
