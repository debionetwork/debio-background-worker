import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Option } from '@polkadot/types';
import { OrderFulfilledCommand } from './order-fulfilled.command';
import {
  DateTimeProxy,
  DebioConversionService,
  NotificationService,
  SubstrateService,
  TransactionLoggingService,
} from '../../../../../common';
import {
  convertToDbioUnitString,
  Order,
  queryEthAdressByAccountId,
  queryOrderDetailByOrderID,
  queryServiceById,
  queryServiceInvoiceByOrderId,
  sendRewards,
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
    private readonly exchangeCacheService: DebioConversionService,
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

      const orderByOrderId = await queryOrderDetailByOrderID(
        this.substrateService.api as any,
        order.id,
      );
      const serviceByOrderId = await queryServiceById(
        this.substrateService.api as any,
        order.serviceId,
      );
      const totalPrice = order.prices.reduce(
        (acc, price) => acc + +price.value,
        0,
      );
      const totalAdditionalPrice = order.additionalPrices.reduce(
        (acc, price) => acc + +price.value,
        0,
      );
      const amountToForward = totalPrice + totalAdditionalPrice;

      if (
        orderByOrderId['orderFlow'] === 'StakingRequestService' &&
        serviceByOrderId['serviceFlow'] === 'StakingRequestService'
      ) {
        const serviceRequest = await queryServiceInvoiceByOrderId(
          this.substrateService.api as any,
          order.id,
        );
        const debioToDai = Number(
          (await this.exchangeCacheService.getExchange())['dbioToDai'],
        );
        const totalPrice = amountToForward * debioToDai;

        // Send reward to customer
        await sendRewards(
          this.substrateService.api as any,
          this.substrateService.pair,
          order.customerId,
          convertToDbioUnitString(totalPrice),
          () => {
            // Write Logging Notification Customer Reward From Request Service
            const customerNotificationInput: NotificationDto = {
              role: 'Customer',
              entity_type: 'Order',
              entity: 'OrderFulfilled',
              description: `Congrats! You’ve received ${totalPrice} DBIO as a reward for completing the request test for ${order.dnaSampleTrackingId} from the service requested, kindly check your balance.`,
              read: false,
              created_at: this.dateTimeProxy.new(),
              updated_at: this.dateTimeProxy.new(),
              deleted_at: null,
              from: 'Debio Network',
              to: order.customerId,
              block_number: blockNumber,
            };

            this.callbackInsertNotificationLogging(customerNotificationInput);
          },
        );

        await queryServiceInvoiceByOrderId(
          this.substrateService.api as any,
          serviceRequest['hash_'],
        );

        // Write Logging Reward Customer Staking Request Service
        const dataCustomerLoggingInput: TransactionLoggingDto = {
          address: order.customerId,
          amount: totalPrice,
          created_at: new Date(),
          currency: 'DBIO',
          parent_id: BigInt(0),
          ref_number: order.id,
          transaction_type: 8,
          transaction_status: 36,
        };
        await this.loggingService.create(dataCustomerLoggingInput);

        // Send reward to lab
        await sendRewards(
          this.substrateService.api as any,
          this.substrateService.pair,
          order.sellerId,
          convertToDbioUnitString(totalPrice / 10),
          () => {
            // Write Logging Notification Lab Reward From Request Service
            const labNotificationInput: NotificationDto = {
              role: 'Lab',
              entity_type: 'Reward',
              entity: 'Request Service Staking',
              description: `Congrats! You’ve received ${
                totalPrice / 10
              } DBIO for completing the request test for ${
                order.dnaSampleTrackingId
              } from the service requested.`,
              read: false,
              created_at: this.dateTimeProxy.new(),
              updated_at: this.dateTimeProxy.new(),
              deleted_at: null,
              from: 'Debio Network',
              to: order.sellerId,
              block_number: blockNumber,
            };

            this.callbackInsertNotificationLogging(labNotificationInput);
          },
        );

        // Write Logging Reward Lab
        const dataLabLoggingInput: TransactionLoggingDto = {
          address: order.customerId,
          amount: totalPrice / 10,
          created_at: new Date(),
          currency: 'DBIO',
          parent_id: BigInt(0),
          ref_number: order.id,
          transaction_type: 8,
          transaction_status: 37,
        };
        await this.loggingService.create(dataLabLoggingInput);
      }
      await this.escrowService.orderFulfilled(order);
      await this.loggingService.create(orderLogging);

      const currDateTime = this.dateTimeProxy.new();

      // Write Logging Notification Customer Reward From Request Service
      const labPaymentNotification: NotificationDto = {
        role: 'Lab',
        entity_type: 'Genetic Testing Order',
        entity: 'Order Fulfilled',
        description: `You've received ${amountToForward} DAI for completeing the requested test for ${order.dnaSampleTrackingId}.`,
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
