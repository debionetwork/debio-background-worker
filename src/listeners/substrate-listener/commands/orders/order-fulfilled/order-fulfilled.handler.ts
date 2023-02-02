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
  Order,
  queryEthAdressByAccountId,
  ServiceFlow,
} from '@debionetwork/polkadot-provider';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import { NotificationDto } from '@common/notification/dto/notification.dto';
import currencyUnit from '../../../models/currencyUnit';
import { TransactionTypeList } from '@common/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '@common/transaction-status/models/transaction-status.list';

@Injectable()
@CommandHandler(OrderFulfilledCommand)
export class OrderFulfilledHandler
  implements ICommandHandler<OrderFulfilledCommand>
{
  private readonly logger: Logger = new Logger(OrderFulfilledCommand.name);

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly substrateService: SubstrateService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
    private readonly exchangeCacheService: DebioConversionService,
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
        transaction_type: TransactionTypeList.Order,
        transaction_status: TransactionStatusList.Fulfilled,
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
        await this.callbackSendReward(
          order,
          amountToForward / currencyUnit[order.currency],
          blockNumber,
        );
      }

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
      this.logger.log(err);
      this.logger.log(`Forward payment failed | err -> ${err}`);
      console.log(err);
    }
  }

  private async callbackSendReward(
    order: Order,
    totalPrice: number,
    blockNumber: string,
  ) {
    try {
      const exchangeFromTo = await this.exchangeCacheService.getExchangeFromTo(
        order.currency.toUpperCase(),
        'DAI',
      );
      const exchange = await this.exchangeCacheService.getExchange();
      const dbioToDai = exchange ? exchange['dbioToDai'] : 1;
      const daiToDbio = 1 / dbioToDai;

      const rewardCustomer = totalPrice * exchangeFromTo.conversion * daiToDbio;
      const rewardLab = rewardCustomer / 10;
      const fixedRewardCustomer = rewardCustomer.toFixed(0);
      const fixedRewardLab = rewardLab.toFixed(0);
      const dbioRewardCustomer = (
        BigInt(fixedRewardCustomer) * BigInt(currencyUnit.DBIO)
      ).toString();
      const dbioRewardLab = (
        BigInt(fixedRewardLab) * BigInt(currencyUnit.DBIO)
      ).toString();

      await this.substrateService.api.tx.rewards
        .rewardFunds(order.customerId, dbioRewardCustomer)
        .signAndSend(this.substrateService.pair, { nonce: -1 });

      // Write Logging Notification Customer Reward From Request Service
      const customerNotificationInput: NotificationDto = {
        role: 'Customer',
        entity_type: 'Order',
        entity: 'Order Fulfilled',
        reference_id: order.dnaSampleTrackingId,
        description: `Congrats! You’ve received ${fixedRewardCustomer} DBIO as a reward for completing the request test for [] from the service requested, kindly check your balance.`,
        read: false,
        created_at: this.dateTimeProxy.new(),
        updated_at: this.dateTimeProxy.new(),
        deleted_at: null,
        from: 'Debio Network',
        to: order.customerId,
        block_number: blockNumber,
      };

      await this.callbackInsertNotificationLogging(customerNotificationInput);

      // Write Logging Reward Customer Staking Request Service
      const dataCustomerLoggingInput: TransactionLoggingDto = {
        address: order.customerId,
        amount: rewardCustomer,
        created_at: new Date(),
        currency: 'DBIO',
        parent_id: BigInt(0),
        ref_number: order.id,
        transaction_type: TransactionTypeList.Reward,
        transaction_status: TransactionStatusList.CustomerStakeRequestService,
      };
      await this.loggingService.create(dataCustomerLoggingInput);

      await this.substrateService.api.tx.rewards
        .rewardFunds(order.sellerId, dbioRewardLab)
        .signAndSend(this.substrateService.pair, { nonce: -1 });

      // Write Logging Notification Lab Reward From Request Service
      const labNotificationInput: NotificationDto = {
        role: 'Lab',
        entity_type: 'Reward',
        entity: 'Request Service Staking',
        reference_id: order.dnaSampleTrackingId,
        description: `Congrats! You’ve received ${fixedRewardLab} DBIO for completing the request test for [] from the service requested.`,
        read: false,
        created_at: this.dateTimeProxy.new(),
        updated_at: this.dateTimeProxy.new(),
        deleted_at: null,
        from: 'Debio Network',
        to: order.sellerId,
        block_number: blockNumber,
      };

      await this.callbackInsertNotificationLogging(labNotificationInput);

      // Write Logging Reward Lab
      const dataLabLoggingInput: TransactionLoggingDto = {
        address: order.customerId,
        amount: rewardLab,
        created_at: new Date(),
        currency: 'DBIO',
        parent_id: BigInt(0),
        ref_number: order.id,
        transaction_type: TransactionTypeList.Reward,
        transaction_status: TransactionStatusList.LabProvideRequestedService,
      };
      await this.loggingService.create(dataLabLoggingInput);
    } catch (err) {
      console.log('error', err);
    }
  }

  private async callbackInsertNotificationLogging(data: NotificationDto) {
    await this.notificationService.insert(data);
  }

  private convertToDate(date: Date) {
    return new Date(Number(date.toString().split(',').join('')));
  }
}
