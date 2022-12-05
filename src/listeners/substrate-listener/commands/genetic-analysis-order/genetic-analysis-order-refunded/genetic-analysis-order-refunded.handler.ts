import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  NotificationService,
  TransactionLoggingService,
} from '@common/index';
import { GeneticAnalysisOrderRefundedCommand } from './genetic-analysis-order-refunded.command';
import { NotificationDto } from '@common/notification/dto/notification.dto';
import { TransactionTypeList } from '@common/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '@common/transaction-status/models/transaction-status.list';
@Injectable()
@CommandHandler(GeneticAnalysisOrderRefundedCommand)
export class GeneticAnalysisOrderRefundedHandler
  implements ICommandHandler<GeneticAnalysisOrderRefundedCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalysisOrderRefundedCommand.name,
  );
  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: GeneticAnalysisOrderRefundedCommand) {
    const geneticAnalysisOrder = command.geneticAnalysisOrders.normalize();
    const blockNumber = command.blockMetaData.blockNumber.toString();
    this.logger.log(
      `Genetic Analysis Order Refunded With GA Order ID: ${geneticAnalysisOrder.id}!`,
    );
    try {
      const isGeneticAnalysisOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalysisOrder.id,
          16,
        );
      const geneticAnalysisOrderHistory =
        await this.loggingService.getLoggingByOrderId(geneticAnalysisOrder.id);

      const geneticAnalysisOrderLogging: TransactionLoggingDto = {
        address: geneticAnalysisOrder.customerId,
        amount: +geneticAnalysisOrder.prices[0].value,
        created_at: geneticAnalysisOrder.updatedAt,
        currency: geneticAnalysisOrder.currency.toUpperCase(),
        parent_id: BigInt(geneticAnalysisOrderHistory.id),
        ref_number: geneticAnalysisOrder.id,
        transaction_type: TransactionTypeList.GeneticAnalysisOrder,
        transaction_status: TransactionStatusList.Refunded,
      };

      if (!isGeneticAnalysisOrderHasBeenInsert) {
        await this.loggingService.create(geneticAnalysisOrderLogging);
      }

      const currDateTime = this.dateTimeProxy.new();

      const notificationInput: NotificationDto = {
        role: 'Customer',
        entity_type: 'Genetic Analysis Orders',
        entity: 'Order Refunded',
        reference_id: geneticAnalysisOrder.id,
        description: `Your service analysis fee from [] has been refunded, kindly check your account balance.`,
        read: false,
        created_at: currDateTime,
        updated_at: currDateTime,
        deleted_at: null,
        from: 'Debio Network',
        to: geneticAnalysisOrder.customerId,
        block_number: blockNumber,
      };

      await this.notificationService.insert(notificationInput);
    } catch (error) {
      this.logger.log(error);
    }
  }
}
