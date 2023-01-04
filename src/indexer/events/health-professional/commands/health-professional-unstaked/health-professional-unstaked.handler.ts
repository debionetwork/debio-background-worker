import { StakeStatus } from '@indexer/models/stake-status';
import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { HealthProfessionalUnstakedCommandIndexer } from './health-professional-unstaked.command';

@Injectable()
@CommandHandler(HealthProfessionalUnstakedCommandIndexer)
export class HealthProfessionalUnstakedHandler
  implements ICommandHandler<HealthProfessionalUnstakedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(
    command: HealthProfessionalUnstakedCommandIndexer,
  ): Promise<any> {
    const { accountId, blockMetaData } = command;

    await this.elasticsearchService.create({
      id: accountId,
      index: 'health-professional',
      refresh: 'wait_for',
      body: {
        stake_status: StakeStatus.Unstaked,
        blockMetaData: blockMetaData,
      },
    });
  }
}
