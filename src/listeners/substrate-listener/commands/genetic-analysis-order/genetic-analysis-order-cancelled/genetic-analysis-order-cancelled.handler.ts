import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import { TransactionLoggingService } from '@common/index';
import { GeneticAnalysisOrderCancelledCommand } from './genetic-analysis-order-cancelled.command';
import { TransactionTypeList } from '@common/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '@common/transaction-status/models/transaction-status.list';

@Injectable()
@CommandHandler(GeneticAnalysisOrderCancelledCommand)
export class GeneticAnalysisOrderCancelledHandler
  implements ICommandHandler<GeneticAnalysisOrderCancelledCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalysisOrderCancelledCommand.name,
  );
  constructor(private readonly loggingService: TransactionLoggingService) {}

  async execute(command: GeneticAnalysisOrderCancelledCommand) {
    const geneticAnalysisOrder = command.geneticAnalysisOrders.normalize();
    this.logger.log(
      `Genetic Analysis Order Cancelled With GA Order ID: ${geneticAnalysisOrder.id}!`,
    );

    try {
      const isGeneticAnalysisOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalysisOrder.id,
          17,
        );
      const isGeneticAnalysisOrderHasBeenPaid =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalysisOrder.id,
          14,
        );
      const geneticAnalysisOrderHistory =
        await this.loggingService.getLoggingByOrderId(geneticAnalysisOrder.id);

      const geneticAnalysisOrderLogging: TransactionLoggingDto = {
        address: geneticAnalysisOrder.customerId,
        amount: Number(geneticAnalysisOrder.prices[0].value),
        created_at: geneticAnalysisOrder.updatedAt,
        currency: geneticAnalysisOrder.currency.toUpperCase(),
        parent_id: BigInt(geneticAnalysisOrderHistory.id),
        ref_number: geneticAnalysisOrder.id,
        transaction_type: TransactionTypeList.GeneticAnalysisOrder,
        transaction_status: TransactionStatusList.Cancelled,
      };

      if (
        !isGeneticAnalysisOrderHasBeenInsert &&
        isGeneticAnalysisOrderHasBeenPaid
      ) {
        await this.loggingService.create(geneticAnalysisOrderLogging);
      }
    } catch (error) {
      this.logger.log(error);
    }
  }
}
