import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  NotificationService,
  TransactionLoggingService,
} from '@common/index';
import { GeneticAnalystVerificationStatusCommand } from './genetic-analyst-verification-status.command';
import { NotificationDto } from '@common/notification/dto/notification.dto';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';
import { TransactionTypeList } from '@common/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '@common/transaction-status/models/transaction-status.list';

@Injectable()
@CommandHandler(GeneticAnalystVerificationStatusCommand)
export class GeneticAnalystVerificationStatusHandler
  implements ICommandHandler<GeneticAnalystVerificationStatusCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalystVerificationStatusCommand.name,
  );
  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly dateTimeProxy: DateTimeProxy,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(command: GeneticAnalystVerificationStatusCommand) {
    let notificationDescription = '';
    let entity = '';
    const geneticAnalyst = command.geneticAnalyst.normalize();
    const blockNumber = command.blockMetaData.blockNumber.toString();

    if (geneticAnalyst.verificationStatus === VerificationStatus.Unverified) {
      return;
    }

    this.logger.log(
      `Genetic Analyst ID: ${geneticAnalyst.accountId} Verify Status ${geneticAnalyst.verificationStatus}!`,
    );

    try {
      const isGeneticAnalystHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalyst.accountId,
          21,
        );
      let transactionStatus: TransactionStatusList;
      if (geneticAnalyst.verificationStatus === 'Verified') {
        transactionStatus = TransactionStatusList.Verified;
        entity = 'Account verified';
        notificationDescription = 'Congrats! Your account has been verified.';
      }
      if (geneticAnalyst.verificationStatus === 'Rejected') {
        transactionStatus = TransactionStatusList.Rejected;
        entity = 'Account rejected';
        notificationDescription =
          'Your account verification has been rejected.';
      }
      if (geneticAnalyst.verificationStatus === 'Revoked') {
        transactionStatus = TransactionStatusList.Revoked;
        entity = 'Account revoked';
        notificationDescription = 'Your account has been revoked.';
      }

      if (!isGeneticAnalystHasBeenInsert) {
        const geneticAnalystHistory =
          await this.loggingService.getLoggingByOrderId(
            geneticAnalyst.accountId,
          );

        const geneticAnalystLogging: TransactionLoggingDto = {
          address: geneticAnalyst.accountId,
          amount: geneticAnalystHistory?.amount ?? 0,
          created_at: new Date(this.dateTimeProxy.now()),
          currency: 'DBIO',
          parent_id: BigInt(geneticAnalystHistory?.id ?? 0),
          ref_number: geneticAnalyst.accountId,
          transaction_type: TransactionTypeList.GeneticAnalyst,
          transaction_status: transactionStatus,
        };

        await this.loggingService.create(geneticAnalystLogging);
      }

      const currDate = this.dateTimeProxy.new();

      const geneticAnalystNotification: NotificationDto = {
        role: 'GA',
        entity_type: 'Verification',
        entity: entity,
        reference_id: null,
        description: notificationDescription,
        read: false,
        created_at: currDate,
        updated_at: currDate,
        deleted_at: null,
        from: 'Debio Network',
        to: geneticAnalyst.accountId,
        block_number: blockNumber,
      };

      await this.notificationService.insert(geneticAnalystNotification);
    } catch (error) {
      this.logger.log(error);
    }
  }
}
