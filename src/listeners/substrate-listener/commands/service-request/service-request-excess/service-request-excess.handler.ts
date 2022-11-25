import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceRequestStakingAmountExcessRefundedCommand } from './service-request-excess.command';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  NotificationService,
  TransactionLoggingService,
} from '@common/index';
import { NotificationDto } from '@common/notification/dto/notification.dto';

@Injectable()
@CommandHandler(ServiceRequestStakingAmountExcessRefundedCommand)
export class ServiceRequestStakingAmountExcessRefunded
  implements ICommandHandler<ServiceRequestStakingAmountExcessRefundedCommand>
{
  private readonly logger: Logger = new Logger(
    ServiceRequestStakingAmountExcessRefundedCommand.name,
  );

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: ServiceRequestStakingAmountExcessRefundedCommand) {
    this.logger.log('Service Request Staking Amount Excess Refunded!');
    const { requesterId, requestId, additionalStakingAmount } = command;
    const blockNumber = command.blockMetadata.blockNumber.toString();
    const loggingServiceRequest = await this.loggingService.getLoggingByOrderId(
      requestId,
    );

    const stakingLogging: TransactionLoggingDto = {
      address: requesterId.toString(),
      amount: Number(additionalStakingAmount),
      created_at: this.dateTimeProxy.new(),
      currency: 'DBIO',
      parent_id: loggingServiceRequest?.id
        ? loggingServiceRequest.id
        : BigInt(0),
      ref_number: requestId.toString(),
      transaction_status: 9,
      transaction_type: 2,
    };

    try {
      const isServiceRequestHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(requestId, 9);
      if (!isServiceRequestHasBeenInsert) {
        await this.loggingService.create(stakingLogging);

        const currDateTime = this.dateTimeProxy.new();

        const notificationInput: NotificationDto = {
          role: 'Customer',
          entity_type: 'Service Request',
          entity: 'Service Request Staking Amount Exess Refunded',
          reference_id: requestId,
          description: `Your over payment staking service request with ID [] has been refunded.`,
          read: false,
          created_at: currDateTime,
          updated_at: currDateTime,
          deleted_at: null,
          from: 'Debio Network',
          to: requesterId,
          block_number: blockNumber,
        };

        await this.notificationService.insert(notificationInput);
      }
    } catch (error) {
      this.logger.log(error);
    }
  }
}
