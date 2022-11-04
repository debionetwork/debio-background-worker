import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderFailedCommand } from './order-failed.command';
import { EscrowService } from '../../../../../common/escrow/escrow.service';
import {
  DateTimeProxy,
  NotificationService,
  SubstrateService,
  TransactionLoggingService,
} from '../../../../../common';
import {
  Order,
  setOrderRefunded,
  finalizeRequest,
  sendRewards,
  eventTypes,
} from '@debionetwork/polkadot-provider';
import { NotificationDto } from '../../../../../common/notification/dto/notification.dto';

@Injectable()
@CommandHandler(OrderFailedCommand)
export class OrderFailedHandler implements ICommandHandler<OrderFailedCommand> {
  private readonly logger: Logger = new Logger(OrderFailedCommand.name);

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly escrowService: EscrowService,
    private readonly substrateService: SubstrateService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: OrderFailedCommand) {
    const order: Order = command.orders.normalize();
    const blockNumber = command.blockMetaData.blockNumber.toString();
    this.logger.log(`OrderFailed With Order ID: ${order.id}!`);

    try {
      const isOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(order.id, 4);

      if (order.orderFlow === 'StakingRequestService') {
        console.log(finalizeRequest);
        finalizeRequest(
          this.substrateService.api as any,
          this.substrateService.pair,
          order.id,
        );
        await this.callbackSendReward(order);
      }

      if (isOrderHasBeenInsert) {
        return;
      }
      await this.escrowService.refundOrder(order);
      await setOrderRefunded(
        this.substrateService.api as any,
        this.substrateService.pair,
        order.id,
      );

      const totalAdditionalPrice = order.additionalPrices.reduce(
        (acc, price) => acc + Number(price.value.split(',').join('')),
        0,
      );

      const currDateTime = this.dateTimeProxy.new();

      const valueMessage =
        eventTypes.role.lab.geneticTesting.DnaSampleQualityControlled.value_message.trimEnd();

      // QC notification to lab
      const labNotification: NotificationDto = {
        role: 'Lab',
        entity_type: 'Genetic Testing Order',
        entity: 'Order Failed',
        reference_id: order.dnaSampleTrackingId,
        description: `${valueMessage} ${
          totalAdditionalPrice / Math.pow(10, 18)
        } DAI as quality control fees for [].`,
        read: false,
        created_at: currDateTime,
        updated_at: currDateTime,
        deleted_at: null,
        from: 'Debio Network',
        to: order.sellerId,
        block_number: blockNumber,
      };

      await this.notificationService.insert(labNotification);
    } catch (error) {
      console.log(error);
      this.logger.log(error);
    }
  }

  async callbackSendReward(order: Order) {
    const rewardCustomer =
      Number(order.additionalPrices[0].value.split(',').join('')) * 10 ** 18;
    const rewardLab = rewardCustomer / 10;
    //send reward for customer
    await sendRewards(
      this.substrateService.api as any,
      this.substrateService.pair,
      order.customerId,
      rewardCustomer.toString(),
    );

    //send reward for customer
    await sendRewards(
      this.substrateService.api as any,
      this.substrateService.pair,
      order.sellerId,
      rewardLab.toString(),
    );
  }
}
