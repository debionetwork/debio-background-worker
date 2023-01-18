import {
  Order,
  queryOrderDetailByOrderID,
  queryServiceRequestById,
  RequestStatus,
  sendRewards,
  ServiceFlow,
  ServiceRequest,
  setOrderPaid,
} from '@debionetwork/polkadot-provider';
import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotificationDto } from '@common/notification/dto/notification.dto';
import {
  DateTimeProxy,
  DebioConversionService,
  NotificationService,
  SubstrateService,
  TransactionLoggingService,
} from '@common/index';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import { ServiceRequestUpdatedCommand } from './service-request-updated.command';
import { TransactionTypeList } from '@common/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '@common/transaction-status/models/transaction-status.list';
import currencyUnit from '@listeners/substrate-listener/models/currencyUnit';

@Injectable()
@CommandHandler(ServiceRequestUpdatedCommand)
export class ServiceRequestUpdatedHandler
  implements ICommandHandler<ServiceRequestUpdatedCommand>
{
  private readonly logger: Logger = new Logger(
    ServiceRequestUpdatedCommand.name,
  );

  constructor(
    private readonly exchangeCacheService: DebioConversionService,
    private readonly loggingService: TransactionLoggingService,
    private readonly dateTimeProxy: DateTimeProxy,
    private readonly substrateService: SubstrateService,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(command: ServiceRequestUpdatedCommand) {
    const { requestId, status, blockMetaData } = command;
    this.logger.log(`Service request ${status}: ${requestId}!`);

    const serviceRequest = (
      await queryServiceRequestById(this.substrateService.api, requestId)
    ).normalize();

    switch (status) {
      case RequestStatus.Claimed:
        await this.onStatusClaimed(serviceRequest, blockMetaData.blockNumber);
        break;
      case RequestStatus.Processed:
        await this.onStatusProcess(serviceRequest);
        break;
      case RequestStatus.Unstaked:
        await this.onStatusUnstaked(serviceRequest);
        break;
      case RequestStatus.WaitingForUnstaked:
        await this.onStatusWaitingForUnstaked(serviceRequest);
        break;
      case RequestStatus.Finalized:
        await this.onStatusFinalized(
          serviceRequest,
          blockMetaData.blockNumber.toString(),
        );
        break;
    }
  }

  async onStatusFinalized(serviceRequest: ServiceRequest, blockNumber: string) {
    const orderDetail = await queryOrderDetailByOrderID(
      this.substrateService.api,
      serviceRequest.orderId,
    );

    const totalPrice = orderDetail.prices.reduce(
      (acc, price) => acc + Number(price.value.split(',').join('')),
      0,
    );
    const totalAdditionalPrice = orderDetail.additionalPrices.reduce(
      (acc, price) => acc + Number(price.value.split(',').join('')),
      0,
    );

    const amountToForward = totalPrice + totalAdditionalPrice;

    if (orderDetail.orderFlow === ServiceFlow.StakingRequestService) {
      await this.callbackSendReward(
        orderDetail,
        amountToForward / currencyUnit[orderDetail.currency],
        blockNumber,
      );
    }
  }

  async onStatusWaitingForUnstaked(serviceRequest: ServiceRequest) {
    try {
      const serviceRequestParent =
        await this.loggingService.getLoggingByOrderId(serviceRequest.hash);
      const isServiceRequestHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          serviceRequest.hash,
          11,
        );
      const stakingLogging: TransactionLoggingDto = {
        address: serviceRequest.requesterAddress,
        amount: 0,
        created_at: this.dateTimeProxy.new(),
        currency: 'DBIO',
        parent_id: BigInt(serviceRequestParent.id),
        ref_number: serviceRequest.hash,
        transaction_type: TransactionTypeList.StakingRequestService,
        transaction_status: TransactionStatusList.WaitingForUnstake,
      };

      if (!isServiceRequestHasBeenInsert) {
        await this.loggingService.create(stakingLogging);
      }
    } catch (error) {
      this.logger.log(error);
    }
  }

  async onStatusUnstaked(serviceRequest: ServiceRequest) {
    try {
      const serviceRequestParent =
        await this.loggingService.getLoggingByOrderId(serviceRequest.hash);
      const isServiceRequestHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          serviceRequest.hash,
          8,
        );
      const stakingLogging: TransactionLoggingDto = {
        address: serviceRequest.requesterAddress,
        amount: serviceRequest.stakingAmount,
        created_at: this.dateTimeProxy.new(),
        currency: 'DBIO',
        parent_id: BigInt(serviceRequestParent.id),
        ref_number: serviceRequest.hash,
        transaction_type: TransactionTypeList.StakingRequestService,
        transaction_status: TransactionStatusList.Unstake,
      };
      if (!isServiceRequestHasBeenInsert) {
        await this.loggingService.create(stakingLogging);
      }
    } catch (error) {
      this.logger.log(error);
    }
  }

  async onStatusProcess(serviceRequest: ServiceRequest) {
    await setOrderPaid(
      this.substrateService.api as any,
      this.substrateService.pair,
      serviceRequest['orderId'],
    );
  }

  async onStatusClaimed(serviceRequest: ServiceRequest, blockNumber: number) {
    const currDateTime = this.dateTimeProxy.new();

    const serviceAvailableNotificationInput: NotificationDto = {
      role: 'Customer',
      entity_type: 'Request Service Staking',
      entity: 'Requested Service Available',
      reference_id: null,
      description: `Congrats! Your requested service is available now. Click here to see your order details.`,
      read: false,
      created_at: currDateTime,
      updated_at: currDateTime,
      deleted_at: null,
      from: 'Debio Network',
      to: serviceRequest.requesterAddress,
      block_number: blockNumber.toString(),
    };

    await this.notificationService.insert(serviceAvailableNotificationInput);
  }

  private async callbackInsertNotificationLogging(data: NotificationDto) {
    await this.notificationService.insert(data);
  }

  private async callbackSendReward(
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

    // Send reward to Customer
    await sendRewards(
      this.substrateService.api as any,
      this.substrateService.pair,
      order.customerId,
      dbioRewardCustomer,
      async () => {
        // Send reward to Lab
        await sendRewards(
          this.substrateService.api as any,
          this.substrateService.pair,
          order.sellerId,
          dbioRewardLab,
        );
      },
    );

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
  }
}
