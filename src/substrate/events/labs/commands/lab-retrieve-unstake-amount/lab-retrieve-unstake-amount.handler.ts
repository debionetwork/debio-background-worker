import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LabRetrieveUnstakeAmountCommand } from './lab-retrieve-unstake-amount.command';

@Injectable()
@CommandHandler(LabRetrieveUnstakeAmountCommand)
export class LabRetrieveUnstakeAmountHandler
  implements ICommandHandler<LabRetrieveUnstakeAmountCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: LabRetrieveUnstakeAmountCommand) {
    const { labs: lab } = command;
    await this.elasticsearchService.update({
      index: 'labs',
      refresh: 'wait_for',
      id: lab.accountId,
      body: {
        doc: {
          stake_amount: lab.stake_amount,
          stake_status: lab.stake_status,
          unstake_at: lab.unstake_at,
          retrieve_unstake_at: lab.retrieve_unstake_at,
          blockMetaData: command.blockMetaData,
        }
      },
    });
  }
}
