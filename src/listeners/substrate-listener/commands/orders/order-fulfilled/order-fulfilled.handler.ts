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
} from '@common/index';
import {
  finalizeRequest,
  Order,
  queryEthAdressByAccountId,
  queryServiceRequestByOrderId,
  sendRewards,
  ServiceFlow,
} from '@debionetwork/polkadot-provider';
import { EscrowService } from '@common/escrow/escrow.service';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import { NotificationDto } from '@common/notification/dto/notification.dto';
import currencyUnit from '../../../models/currencyUnit';

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
    const order: Order = command.orders;
    const blockNumber = command.blockMetaData.blockNumber.toString();
    this.logger.log(`Order Fulfilled With Order ID: ${order.id}!`);

    try {
      const isOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(order.id, 3);

      const orderHistory = await this.loggingService.getLoggingByOrderId(
        order.id,
      );

      const totalPrice = order.prices.reduce(
        (acc, price) => acc + Number(price.value.split(',').join('')),
        0,
      );
      const totalAdditionalPrice = order.additionalPrices.reduce(
        (acc, price) => acc + Number(price.value.split(',').join('')),
        0,
      );

      const amountToForward = totalPrice + totalAdditionalPrice;

      // Logging data input
      const orderLogging: TransactionLoggingDto = {
        address: order.customerId,
        amount: amountToForward / currencyUnit[order.currency],
        created_at: this.convertToDate(order.updatedAt),
        currency: order.currency.toUpperCase(),
        parent_id: orderHistory?.id ? BigInt(orderHistory.id) : BigInt(0),
        ref_number: order.id,
        transaction_status: 3,
        transaction_type: 1,
      };

      // Logging transaction
      if (isOrderHasBeenInsert) {
        await this.loggingService.updateHash(
          isOrderHasBeenInsert,
          command.blockMetaData.blockHash,
        );
        return;
      }
      const labEthAddress: any = await queryEthAdressByAccountId(
        this.substrateService.api as any,
        order['sellerId'],
      );

      if ((labEthAddress as Option<any>).isNone) {
        this.logger.log(
          `Eth address by account id: ${order.customerId} is none!`,
        );
        return null;
      }

      if (order.orderFlow === ServiceFlow.StakingRequestService) {
        const requestId = await queryServiceRequestByOrderId(
          this.substrateService.api,
          order.id,
        );

        await finalizeRequest(
          this.substrateService.api as any,
          this.substrateService.pair,
          requestId,
        );

        await this.callbackSendReward(
          order,
          amountToForward / currencyUnit[order.currency],
          blockNumber,
        );
      }

      await this.escrowService.orderFulfilled(order);
      await this.loggingService.create(orderLogging);

      const currDateTime = this.dateTimeProxy.new();

      // Write Logging Notification Customer Reward From Request Service
      const labPaymentNotification: NotificationDto = {
        role: 'Lab',
        entity_type: 'Genetic Testing Order',
        entity: 'Order Fulfilled',
        reference_id: order.dnaSampleTrackingId,
        description: `You've received ${
          amountToForward / currencyUnit[order.currency]
        } ${order.currency} for completeing the requested test for [].`,
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
      console.log(err);
      this.logger.log(err);
      this.logger.log(`Forward payment failed | err -> ${err}`);
    }
  }

  callbackInsertNotificationLogging(data: NotificationDto) {
    this.notificationService.insert(data);
  }

  async callbackSendReward(
    order: Order,
    totalPrice: number,
    blockNumber: string,
  ) {
    const exchangeFromTo = await this.exchangeCacheService.getExchangeFromTo(
      order.currency.toUpperCase(),
      'DAI',
    );
    const exchange = await this.exchangeCacheService.getExchange();
    const dbioToDai = exchange ? exchange['dbioToDai'] : 1;
    const daiToDbio = 1 / dbioToDai;

    const dbioCurrency = totalPrice * exchangeFromTo.conversion * daiToDbio;

    const dbioRewardCustomer = dbioCurrency.toFixed(4);
    const dbioRewardLab = (dbioCurrency / 10).toFixed(4);
    // Send reward to customer
    await sendRewards(
      this.substrateService.api as any,
      this.substrateService.pair,
      order.customerId,
      dbioRewardCustomer,
    );

    // Write Logging Notification Customer Reward From Request Service
    const customerNotificationInput: NotificationDto = {
      role: 'Customer',
      entity_type: 'Order',
      entity: 'Order Fulfilled',
      reference_id: order.dnaSampleTrackingId,
      description: `Congrats! You’ve received ${dbioRewardCustomer} DBIO as a reward for completing the request test for [] from the service requested, kindly check your balance.`,
      read: false,
      created_at: this.dateTimeProxy.new(),
      updated_at: this.dateTimeProxy.new(),
      deleted_at: null,
      from: 'Debio Network',
      to: order.customerId,
      block_number: blockNumber,
    };

    this.callbackInsertNotificationLogging(customerNotificationInput);

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
      dbioRewardLab,
    );

    // Write Logging Notification Lab Reward From Request Service
    const labNotificationInput: NotificationDto = {
      role: 'Lab',
      entity_type: 'Reward',
      entity: 'Request Service Staking',
      reference_id: order.dnaSampleTrackingId,
      description: `Congrats! You’ve received ${dbioRewardLab} DBIO for completing the request test for [] from the service requested.`,
      read: false,
      created_at: this.dateTimeProxy.new(),
      updated_at: this.dateTimeProxy.new(),
      deleted_at: null,
      from: 'Debio Network',
      to: order.sellerId,
      block_number: blockNumber,
    };

    this.callbackInsertNotificationLogging(labNotificationInput);

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

  private convertToDate(date: Date) {
    return new Date(Number(date.toString().split(',').join('')));
  }
}
