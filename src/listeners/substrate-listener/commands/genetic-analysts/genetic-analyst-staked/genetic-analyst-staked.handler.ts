import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import { DateTimeProxy, TransactionLoggingService } from '@common/index';
import { GeneticAnalystStakedCommand } from './genetic-analyst-staked.command';
import { TransactionTypeList } from '@common/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '@common/transaction-status/models/transaction-status.list';

@Injectable()
@CommandHandler(GeneticAnalystStakedCommand)
export class GeneticAnalystStakedHandler
  implements ICommandHandler<GeneticAnalystStakedCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalystStakedCommand.name,
  );
  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: GeneticAnalystStakedCommand) {
    const geneticAnalyst = command.geneticAnalyst.normalize();
    this.logger.log(
      `Genetic Analyst Staked With GA ID: ${geneticAnalyst.accountId}!`,
    );

    try {
      const isGeneticAnalystHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalyst.accountId,
          19,
        );
      const geneticAnalystLogging: TransactionLoggingDto = {
        address: geneticAnalyst.accountId,
        amount: geneticAnalyst.stakeAmount,
        created_at: new Date(this.dateTimeProxy.now()),
        currency: 'DBIO',
        parent_id:
          BigInt(Number(isGeneticAnalystHasBeenInsert.id)) || BigInt(0),
        ref_number: geneticAnalyst.accountId,
        transaction_type: TransactionTypeList.StakingGeneticAnalyst,
        transaction_status: TransactionStatusList.Staked,
      };
      await this.loggingService.create(geneticAnalystLogging);
    } catch (error) {
      this.logger.log(error);
    }
  }
}
