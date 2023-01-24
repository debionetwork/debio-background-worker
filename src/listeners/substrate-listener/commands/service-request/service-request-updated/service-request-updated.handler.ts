import {
  queryServiceRequestById,
  RequestStatus,
  ServiceRequest,
  setOrderPaid,
} from '@debionetwork/polkadot-provider';
import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotificationDto } from '@common/notification/dto/notification.dto';
import {
  DateTimeProxy,
  NotificationService,
  SubstrateService,
  TransactionLoggingService,
} from '@common/index';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import { ServiceRequestUpdatedCommand } from './service-request-updated.command';
import { TransactionTypeList } from '@common/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '@common/transaction-status/models/transaction-status.list';

@Injectable()
@CommandHandler(ServiceRequestUpdatedCommand)
export class ServiceRequestUpdatedHandler
  implements ICommandHandler<ServiceRequestUpdatedCommand>
{
  private readonly logger: Logger = new Logger(
    ServiceRequestUpdatedCommand.name,
  );

  constructor(
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
}
