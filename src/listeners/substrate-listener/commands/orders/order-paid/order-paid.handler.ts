import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderPaidCommand } from './order-paid.command';
import {
  DateTimeProxy,
  NotificationService,
  SubstrateService,
  TransactionLoggingService,
} from '../../../../../common';
import { TransactionLoggingDto } from '../../../../../common/transaction-logging/dto/transaction-logging.dto';
import {
  Order,
  queryLabById,
  queryServiceById,
} from '@debionetwork/polkadot-provider';
import { NotificationDto } from '../../../../../common/notification/dto/notification.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { NewOrderLab } from '../../../models/new-order-lab.model';
import { keyList } from '../../../../../secrets';

@Injectable()
@CommandHandler(OrderPaidCommand)
export class OrderPaidHandler implements ICommandHandler<OrderPaidCommand> {
  private readonly logger: Logger = new Logger(OrderPaidCommand.name);

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
    private readonly substrateService: SubstrateService,
    private readonly mailerService: MailerService,
    private readonly gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
  ) {}

  async execute(command: OrderPaidCommand) {
    const order: Order = command.orders.normalize();
    const blockNumber = command.blockMetaData.blockNumber.toString();
    this.logger.log(`OrderPaid with Order ID: ${order.id}!`);

    try {
      const isOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(order.id, 2);
      const orderHistory = await this.loggingService.getLoggingByOrderId(
        order.id,
      );

      if (!isOrderHasBeenInsert) {
        //insert logging to DB
        const orderLogging: TransactionLoggingDto = {
          address: order.customerId,
          amount: +order.additionalPrices[0].value + +order.prices[0].value,
          created_at: order.updatedAt,
          currency: order.currency.toUpperCase(),
          parent_id: orderHistory?.id ? BigInt(orderHistory.id) : BigInt(0),
          ref_number: order.id,
          transaction_status: 2,
          transaction_type: 1,
        };

        await this.loggingService.create(orderLogging);

        const currDateTime = this.dateTimeProxy.new();

        // notification to lab
        const notificationNewOrder: NotificationDto = {
          role: 'Lab',
          entity_type: 'Lab',
          entity: 'New Order',
          reference_id: order.id,
          description: `A new order ([]) is awaiting process.`,
          read: false,
          created_at: currDateTime,
          updated_at: currDateTime,
          deleted_at: null,
          from: 'Debio Network',
          to: order.sellerId,
          block_number: blockNumber,
        };
        await this.notificationService.insert(notificationNewOrder);

        const labDetail = await queryLabById(
          this.substrateService.api,
          order.sellerId,
        );
        const serviceDetail = await queryServiceById(
          this.substrateService.api,
          order.serviceId,
        );

        const linkOrder =
          this.gCloudSecretManagerService
            .getSecret('LAB_ORDER_LINK')
            .toString() + order.id;

        await this.sendNewOrderToLab(labDetail.info.email, {
          specimen_number: order.dnaSampleTrackingId,
          service: serviceDetail.info.name,
          service_price: serviceDetail.price,
          qc_price: serviceDetail.qcPrice,
          order_id: order.id,
          order_date: order.createdAt.toDateString(),
          link_order: `${linkOrder}/process`,
        });
      }
    } catch (error) {
      this.logger.log(error);
    }
  }

  async sendNewOrderToLab(to: string, context: NewOrderLab) {
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
      template: 'new-order-lab',
      context: context,
    });
  }
}
