import { StakeStatus } from '@indexer/models/stake-status';
import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { HealthProfessionalStakedCommandIndexer } from './health-professional-staked.command';

@Injectable()
@CommandHandler(HealthProfessionalStakedCommandIndexer)
export class HealthProfessionalStakedHandler
  implements ICommandHandler<HealthProfessionalStakedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: HealthProfessionalStakedCommandIndexer): Promise<any> {
    const { accountId, balance, blockMetaData } = command;

    await this.elasticsearchService.create({
      id: accountId,
      index: 'health-professional',
      refresh: 'wait_for',
      body: {
        stake_amount: balance,
        stake_status: StakeStatus.Staked,
        blockMetaData: blockMetaData,
      },
    });
  }
}
