import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceRequestCreatedCommand } from './service-request-created.command';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  MailerManager,
  NotificationService,
  TransactionLoggingService,
} from '@common/index';
import { CountryService } from '@common/location/country.service';
import { StateService } from '@common/location/state.service';
import { NotificationDto } from '@common/notification/dto/notification.dto';
import { TransactionTypeList } from '@common/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '@common/transaction-status/models/transaction-status.list';
import { config } from 'src/config';

@Injectable()
@CommandHandler(ServiceRequestCreatedCommand)
export class ServiceRequestCreatedHandler
  implements ICommandHandler<ServiceRequestCreatedCommand>
{
  private readonly logger: Logger = new Logger(
    ServiceRequestCreatedCommand.name,
  );

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly countryService: CountryService,
    private readonly stateService: StateService,
    private readonly mailerManager: MailerManager,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: ServiceRequestCreatedCommand) {
    const serviceRequest = command.request.normalize();
    const blockNumber = command.blockMetadata.blockNumber.toString();
    this.logger.log(
      `Service Request Created With Hash: ${serviceRequest.hash}!`,
    );
    const stakingLogging: TransactionLoggingDto = {
      address: serviceRequest.requesterAddress,
      amount: serviceRequest.stakingAmount,
      created_at: serviceRequest.createdAt,
      currency: 'DBIO',
      parent_id: BigInt(0),
      ref_number: serviceRequest.hash,
      transaction_type: TransactionTypeList.StakingRequestService,
      transaction_status: TransactionStatusList.Stake,
    };

    try {
      const isServiceRequestHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          serviceRequest.hash,
          7,
        );
      if (!isServiceRequestHasBeenInsert) {
        await this.loggingService.create(stakingLogging);
        await this._sendEmailNotificationServiceRequestCreated(command);
      }

      const currDateTime = this.dateTimeProxy.new();

      const notificationInput: NotificationDto = {
        role: 'Customer',
        entity_type: 'Request Service Staking',
        entity: 'Requested Service Created',
        reference_id: serviceRequest.hash,
        description: `You've successfully submitted your requested service with staking ID [].`,
        read: false,
        created_at: currDateTime,
        updated_at: currDateTime,
        deleted_at: null,
        from: 'Debio Network',
        to: serviceRequest.requesterAddress,
        block_number: blockNumber,
      };

      await this.notificationService.insert(notificationInput);
    } catch (error) {
      this.logger.log(error);
    }
  }

  async _sendEmailNotificationServiceRequestCreated(
    command: ServiceRequestCreatedCommand,
  ) {
    const serviceRequest = await command.request;
    const countryName = await (
      await this.countryService.getByIso2Code(serviceRequest.country)
    ).name;
    const regionName = await (
      await this.stateService.getState(
        serviceRequest.country,
        serviceRequest.region,
      )
    ).name;

    const context = {
      service_name: serviceRequest.serviceCategory,
      public_address: serviceRequest.requesterAddress,
      country: countryName || serviceRequest.country,
      state: regionName || serviceRequest.region,
      city: serviceRequest.city,
      amount: serviceRequest.stakingAmount,
      currency: 'DBIO',
    };

    await this.mailerManager.sendCustomerStakingRequestServiceEmail(
      config.EMAILS.split(','),
      context,
    );
  }
}
