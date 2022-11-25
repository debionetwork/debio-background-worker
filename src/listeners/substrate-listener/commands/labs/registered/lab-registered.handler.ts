import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LabRegisteredCommand } from './lab-registered.command';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  NotificationService,
  TransactionLoggingService,
} from '@common/index';
import { NotificationDto } from '@common/notification/dto/notification.dto';

@Injectable()
@CommandHandler(LabRegisteredCommand)
export class LabRegisteredHandler
  implements ICommandHandler<LabRegisteredCommand>
{
  private readonly logger: Logger = new Logger(LabRegisteredCommand.name);

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: LabRegisteredCommand) {
    const lab = command.lab.normalize();
    const blockNumber = command.blockMetadata.blockNumber.toString();
    this.logger.log(`Lab ID: ${lab.accountId} is Registered!`);
    const stakingLogging: TransactionLoggingDto = {
      address: lab.accountId,
      amount: lab.stakeAmount,
      created_at: this.dateTimeProxy.new(),
      currency: 'DBIO',
      parent_id: BigInt(0),
      ref_number: lab.accountId,
      transaction_status: 28, // Lab Unverified
      transaction_type: 7, // Lab
    };

    try {
      const isLabHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          lab.accountId,
          28, // lab Unverified
        );
      if (!isLabHasBeenInsert) {
        await this.loggingService.create(stakingLogging);
      }

      const currDateTime = this.dateTimeProxy.new();

      const notificationInput: NotificationDto = {
        role: 'Lab',
        entity_type: 'Labs',
        entity: 'Lab Registered',
        reference_id: null,
        description: `Congrats! You have been submitted your account verification.`,
        read: false,
        created_at: currDateTime,
        updated_at: currDateTime,
        deleted_at: null,
        from: 'Debio Network',
        to: lab.accountId,
        block_number: blockNumber,
      };

      await this.notificationService.insert(notificationInput);
    } catch (error) {
      this.logger.log(error);
    }
  }
}
