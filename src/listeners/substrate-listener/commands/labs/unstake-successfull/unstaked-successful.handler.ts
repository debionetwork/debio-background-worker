import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import { DateTimeProxy, TransactionLoggingService } from '@common/index';
import { LabUnstakedCommand } from './unstaked-successful.command';
import { TransactionTypeList } from '@common/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '@common/transaction-status/models/transaction-status.list';

@Injectable()
@CommandHandler(LabUnstakedCommand)
export class labUnstakedHandler implements ICommandHandler<LabUnstakedCommand> {
  private readonly logger: Logger = new Logger(LabUnstakedCommand.name);
  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: LabUnstakedCommand) {
    const lab = command.lab.normalize();
    this.logger.log(`Lab ID: ${lab.accountId} Unstaked Successful!`);

    try {
      const tenMinuteInMiliSecond = 10 * 60 * 1000;
      const isLabHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          lab.accountId,
          27, // Lab Waiting For Unstaked
        );
      const labParent = await this.loggingService.getLoggingByOrderId(
        lab.accountId,
      );
      const labLogging: TransactionLoggingDto = {
        address: lab.accountId,
        amount: 0,
        created_at: new Date(this.dateTimeProxy.now()),
        currency: 'DBIO',
        parent_id: BigInt(Number(labParent.id)),
        ref_number: lab.accountId,
        transaction_type: TransactionTypeList.StakingLab, // Staking Lab
        transaction_status: TransactionStatusList.WaitingForUnstaked, // Lab Waiting For Unstaked
      };

      let isLabHasBeenInsertTenMinuteAgo = false;

      if (isLabHasBeenInsert) {
        isLabHasBeenInsertTenMinuteAgo =
          Number(new Date(new Date(this.dateTimeProxy.now())).getTime()) -
            Number(new Date(isLabHasBeenInsert.created_at).getTime()) <=
          tenMinuteInMiliSecond;
      }
      if (!isLabHasBeenInsert || isLabHasBeenInsertTenMinuteAgo === false) {
        await this.loggingService.create(labLogging);
      }
    } catch (error) {
      this.logger.log(error);
    }
  }
}
