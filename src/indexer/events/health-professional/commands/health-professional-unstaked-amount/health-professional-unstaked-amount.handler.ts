import { StakeStatus } from '@indexer/models/stake-status';
import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { HealthProfessionalUnstakedAmountCommandIndexer } from './health-professional-unstaked-amount.command';

@Injectable()
@CommandHandler(HealthProfessionalUnstakedAmountCommandIndexer)
export class HealthProfessionalUnstakedAmountHandler
  implements ICommandHandler<HealthProfessionalUnstakedAmountCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(
    command: HealthProfessionalUnstakedAmountCommandIndexer,
  ): Promise<any> {
    const { accountId, balance, blockMetaData } = command;

    await this.elasticsearchService.update({
      id: accountId,
      index: 'health-professional',
      refresh: 'wait_for',
      body: {
        doc: {
          stake_amount: balance,
          stake_status: StakeStatus.Unstaked,
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
