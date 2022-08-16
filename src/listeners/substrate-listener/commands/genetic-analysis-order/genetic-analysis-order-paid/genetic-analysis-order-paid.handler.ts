import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '../../../../../common/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  MailerManager,
  NotificationService,
  ProcessEnvProxy,
  SubstrateService,
  TransactionLoggingService,
} from '../../../../../common';
import { GeneticAnalysisOrderPaidCommand } from './genetic-analysis-order-paid.command';
import { NotificationDto } from '../../../../../common/notification/dto/notification.dto';
import {
  queryGeneticAnalystByAccountId,
  queryGeneticAnalystServicesByHashId,
} from '@debionetwork/polkadot-provider';
import { NewOrderGA } from '../../../models/new-order-ga.model';
import { MailerService } from '@nestjs-modules/mailer';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';

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
    private readonly mailerService: MailerService,
    private readonly gCloudSecretManagerService: GCloudSecretManagerService,
  ) {}

  async execute(command: GeneticAnalysisOrderPaidCommand) {
    const geneticAnalysisOrder = command.geneticAnalysisOrders.normalize();
    const blockNumber = command.blockMetaData.blockNumber.toString();
    await this.logger.log(
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
          transaction_status: 14,
          transaction_type: 3,
        };

        await this.loggingService.create(geneticAnalysisOrderLogging);
      }

      const currDateTime = this.dateTimeProxy.new();

      const notificationNewOrderGeneticAnalyst: NotificationDto = {
        role: 'GA',
        entity_type: 'Genetic Analyst',
        entity: 'New Order',
        reference_id: geneticAnalysisOrder.geneticAnalysisTrackingId,
        description: `A new order [] is awaiting process.`,
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
        this.gCloudSecretManagerService.getSecret('GA_ORDER_LINK').toString() +
        geneticAnalysisOrder.id;

      await this.sendNewOrderToGa(geneticAnaystDetail.info.email, {
        service: geneticAnalystServiceDetail.info.name,
        price:
          geneticAnalystServiceDetail.info.pricesByCurrency[0].totalPrice.toString(),
        order_id: geneticAnalysisOrder.id,
        order_date: geneticAnalysisOrder.createdAt.toDateString(),
        link_order: linkOrder,
      });
    } catch (error) {
      await this.logger.log(error);
    }
  }

  async sendNewOrderToGa(to: string, context: NewOrderGA) {
    let subject = `New Order #1`;
    if (
      this.gCloudSecretManagerService.getSecret('POSTGRES_HOST').toString() ===
      'localhost'
    ) {
      subject = `Testing New Service Request Email`;
    }
    this.mailerService.sendMail({
      to: to,
      subject: subject,
      template: 'new-order-ga',
      context: context,
    });
  }
}
