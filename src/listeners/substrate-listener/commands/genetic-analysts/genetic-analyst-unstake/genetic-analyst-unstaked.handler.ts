import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import { DateTimeProxy, TransactionLoggingService } from '@common/index';
import { GeneticAnalystUnstakedCommand } from './genetic-analyst-unstaked.command';
import { TransactionTypeList } from '@common/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '@common/transaction-status/models/transaction-status.list';

@Injectable()
@CommandHandler(GeneticAnalystUnstakedCommand)
export class GeneticAnalystUnstakedHandler
  implements ICommandHandler<GeneticAnalystUnstakedCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalystUnstakedCommand.name,
  );
  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: GeneticAnalystUnstakedCommand) {
    const geneticAnalyst = command.geneticAnalyst.normalize();
    this.logger.log(
      `Genetic Analyst Unstaked! With GA ID: ${geneticAnalyst.accountId}`,
    );

    try {
      const isGeneticAnalystHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          geneticAnalyst.accountId,
          19,
        );

      const geneticAnalystLogging: TransactionLoggingDto = {
        address: geneticAnalyst.accountId,
        amount: isGeneticAnalystHasBeenInsert.amount,
        created_at: new Date(this.dateTimeProxy.now()),
        currency: 'DBIO',
        parent_id: BigInt(Number(isGeneticAnalystHasBeenInsert.id)),
        ref_number: geneticAnalyst.accountId,
        transaction_type: TransactionTypeList.StakingGeneticAnalyst,
        transaction_status: TransactionStatusList.Unstaked,
      };

      await this.loggingService.create(geneticAnalystLogging);
    } catch (error) {
      this.logger.log(error);
    }
  }
}
