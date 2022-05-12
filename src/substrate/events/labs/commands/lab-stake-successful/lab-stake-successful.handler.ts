import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LabStakeSuccessfulCommand } from './lab-stake-successful.command';

@Injectable()
@CommandHandler(LabStakeSuccessfulCommand)
export class LabStakeSuccessfulHandler
  implements ICommandHandler<LabStakeSuccessfulCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: LabStakeSuccessfulCommand) {
    const { labs: lab } = command;
    await this.elasticsearchService.update({
      index: 'labs',
      refresh: 'wait_for',
      id: lab.accountId,
      body : {
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
