import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateTimeProxy } from '../../../../../common';
import { LabUpdateVerificationStatusCommand } from './update-verification-status.command';
import { NotificationDto } from '../../../../../common/notification/dto/notification.dto';
import { NotificationService } from '../../../../../common/notification/notification.service';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';
@Injectable()
@CommandHandler(LabUpdateVerificationStatusCommand)
export class LabUpdateVerificationStatusHandler
  implements ICommandHandler<LabUpdateVerificationStatusCommand>
{
  private readonly logger: Logger = new Logger(
    LabUpdateVerificationStatusCommand.name,
  );
  constructor(
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: LabUpdateVerificationStatusCommand) {
    const lab = command.labs.normalize();
    const blockNumber = command.blockMetaData.blockNumber.toString();
    this.logger.log(
      `Lab ID: ${lab.accountId} Update Verification Status ${lab.verificationStatus}!`,
    );

    const description = this.notificationDescription(lab.verificationStatus);

    if (description === null) {
      return;
    }

    const notificationInput: NotificationDto = {
      role: 'Lab',
      entity_type: 'Verification',
      entity: `Account ${lab.verificationStatus}`,
      reference_id: null,
      description: description,
      read: false,
      created_at: await this.dateTimeProxy.new(),
      updated_at: await this.dateTimeProxy.new(),
      deleted_at: null,
      from: 'Debio Network',
      to: lab.accountId,
      block_number: blockNumber,
    };

    try {
      await this.notificationService.insert(notificationInput);
    } catch (error) {
      this.logger.log(error);
    }
  }

  private notificationDescription(status: VerificationStatus): string | null {
    if (status === VerificationStatus.Rejected) {
      return 'Your account verification has been rejected.';
    } else if (status === VerificationStatus.Revoked) {
      return 'Your account has been revoked.';
    } else if (status === VerificationStatus.Verified) {
      return 'Congrats! Your account has been verified.';
    } else {
      return null;
    }
  }
}
