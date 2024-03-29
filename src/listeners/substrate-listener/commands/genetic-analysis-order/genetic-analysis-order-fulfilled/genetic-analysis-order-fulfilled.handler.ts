import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  NotificationService,
  TransactionLoggingService,
} from '@common/index';
import { GeneticAnalysisOrderFulfilledCommand } from './genetic-analysis-order-fulfilled.command';
import { NotificationDto } from '@common/notification/dto/notification.dto';
import currencyUnit from '../../../models/currencyUnit';
import { TransactionTypeList } from '@common/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '@common/transaction-status/models/transaction-status.list';

@Injectable()
@CommandHandler(GeneticAnalysisOrderFulfilledCommand)
export class GeneticAnalysisOrderFulfilledHandler
  implements ICommandHandler<GeneticAnalysisOrderFulfilledCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalysisOrderFulfilledCommand.name,
  );

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: GeneticAnalysisOrderFulfilledCommand) {
    const { geneticAnalysisOrders, blockMetaData } = command;
    const geneticAnalysisOrder = { ...geneticAnalysisOrders };
    const blockNumber = blockMetaData.blockNumber.toString();
    this.logger.log(
      `Genetic Analysis Order Fulfilled! With GA Order ID: ${geneticAnalysisOrder.id}`,
    );

    try {
      const isGeneticAnalysisOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalysisOrder.id,
          15,
        );

      const geneticAnalysisOrderHistory =
        await this.loggingService.getLoggingByOrderId(geneticAnalysisOrder.id);

      const totalPrice = geneticAnalysisOrder.prices.reduce(
        (acc, price) => acc + Number(price.value.split(',').join('')),
        0,
      );
      const totalAdditionalPrice = geneticAnalysisOrder.additionalPrices.reduce(
        (acc, price) => acc + Number(price.value.split(',').join('')),
        0,
      );

      const amountToForward =
        (totalPrice + totalAdditionalPrice) /
        currencyUnit[geneticAnalysisOrder.currency];

      const geneticAnalysisOrderLogging: TransactionLoggingDto = {
        address: geneticAnalysisOrder.customerId,
        amount: amountToForward,
        created_at: this.convertToDate(geneticAnalysisOrder.updatedAt),
        currency: geneticAnalysisOrder.currency.toUpperCase(),
        parent_id: BigInt(geneticAnalysisOrderHistory.id),
        ref_number: geneticAnalysisOrder.id,
        transaction_type: TransactionTypeList.GeneticAnalysisOrder,
        transaction_status: TransactionStatusList.Fulfilled,
      };

      const serviceChargeLogging: TransactionLoggingDto = {
        address: geneticAnalysisOrder.customerId,
        amount: (amountToForward * 5) / 100, //5% prices
        created_at: this.convertToDate(geneticAnalysisOrder.updatedAt),
        currency: geneticAnalysisOrder.currency.toUpperCase(),
        parent_id: BigInt(geneticAnalysisOrderHistory.id),
        ref_number: geneticAnalysisOrder.id,
        transaction_type: TransactionTypeList.GeneticAnalysisOrder,
        transaction_status: TransactionStatusList.Fulfilled,
      };

      if (!isGeneticAnalysisOrderHasBeenInsert) {
        await this.loggingService.create(geneticAnalysisOrderLogging);
        await this.loggingService.create(serviceChargeLogging);
      }

      const currDate = this.dateTimeProxy.new();

      const receivePaymentNotification: NotificationDto = {
        role: 'GA',
        entity_type: 'Genetic Analysis Order',
        entity: 'Order Fulfilled',
        reference_id: geneticAnalysisOrder.id,
        description: `You've received ${amountToForward} ${geneticAnalysisOrder.currency} for completing the requested analysis for [].`,
        read: false,
        created_at: currDate,
        updated_at: currDate,
        deleted_at: null,
        from: 'Debio Network',
        to: geneticAnalysisOrder.sellerId,
        block_number: blockNumber,
      };

      await this.notificationService.insert(receivePaymentNotification);
    } catch (error) {
      this.logger.log(error);
    }
  }

  private convertToDate(date: Date) {
    return new Date(Number(date.toString().split(',').join('')));
  }
}
