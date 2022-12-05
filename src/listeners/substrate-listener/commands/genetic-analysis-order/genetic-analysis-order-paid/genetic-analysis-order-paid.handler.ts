import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  MailerManager,
  NotificationService,
  SubstrateService,
  TransactionLoggingService,
} from '@common/index';
import { GeneticAnalysisOrderPaidCommand } from './genetic-analysis-order-paid.command';
import { NotificationDto } from '@common/notification/dto/notification.dto';
import {
  queryGeneticAnalystByAccountId,
  queryGeneticAnalystServicesByHashId,
} from '@debionetwork/polkadot-provider';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { keyList } from '@common/secrets';
import { TransactionTypeList } from '@common/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '@common/transaction-status/models/transaction-status.list';

@Injectable()
@CommandHandler(GeneticAnalysisOrderPaidCommand)
export class GeneticAnalysisOrderPaidHandler
  implements ICommandHandler<GeneticAnalysisOrderPaidCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalysisOrderPaidCommand.name,
  );

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
    private readonly substrateService: SubstrateService,
    private readonly mailerManager: MailerManager,
    private readonly gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
  ) {}

  async execute(command: GeneticAnalysisOrderPaidCommand) {
    const geneticAnalysisOrder = command.geneticAnalysisOrders.normalize();
    const blockNumber = command.blockMetaData.blockNumber.toString();
    this.logger.log(
      `Genetic Analysis Order Paid With GA Order ID: ${geneticAnalysisOrder.id}!`,
    );

    try {
      const isGeneticAnalysisOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalysisOrder.id,
          14,
        );
      const geneticAnalysisOrderHistory =
        await this.loggingService.getLoggingByOrderId(geneticAnalysisOrder.id);

      if (!isGeneticAnalysisOrderHasBeenInsert) {
        const geneticAnalysisOrderLogging: TransactionLoggingDto = {
          address: geneticAnalysisOrder.customerId,
          amount: +geneticAnalysisOrder.prices[0].value,
          created_at: geneticAnalysisOrder.updatedAt,
          currency: geneticAnalysisOrder.currency.toUpperCase(),
          parent_id: BigInt(geneticAnalysisOrderHistory.id ?? 0),
          ref_number: geneticAnalysisOrder.id,
          transaction_type: TransactionTypeList.GeneticAnalysisOrder,
          transaction_status: TransactionStatusList.Paid,
        };

        await this.loggingService.create(geneticAnalysisOrderLogging);
      }

      const currDateTime = this.dateTimeProxy.new();

      const notificationNewOrderGeneticAnalyst: NotificationDto = {
        role: 'GA',
        entity_type: 'Genetic Analyst',
        entity: 'New Order',
        reference_id: geneticAnalysisOrder.id,
        description: `A new order ${geneticAnalysisOrder.geneticAnalysisTrackingId} is awaiting process.`,
        read: false,
        created_at: currDateTime,
        updated_at: currDateTime,
        deleted_at: null,
        from: 'Debio Network',
        to: geneticAnalysisOrder.sellerId,
        block_number: blockNumber,
      };

      this.notificationService.insert(notificationNewOrderGeneticAnalyst);

      const geneticAnaystDetail = await queryGeneticAnalystByAccountId(
        this.substrateService.api,
        geneticAnalysisOrder.sellerId,
      );
      const geneticAnalystServiceDetail =
        await queryGeneticAnalystServicesByHashId(
          this.substrateService.api,
          geneticAnalysisOrder.serviceId,
        );

      const linkOrder =
        this.gCloudSecretManagerService
          .getSecret('GA_ORDER_LINK')
          ?.toString() ?? '' + geneticAnalysisOrder.id;

      await this.mailerManager.sendNewOrderToGa(
        geneticAnaystDetail.info.email,
        {
          service: geneticAnalystServiceDetail.info.name,
          price:
            geneticAnalystServiceDetail.info.pricesByCurrency[0].totalPrice.toString(),
          order_id: geneticAnalysisOrder.id,
          order_date: geneticAnalysisOrder.createdAt.toDateString(),
          link_order: linkOrder,
        },
      );
    } catch (error) {
      this.logger.log(error);
    }
  }
}
