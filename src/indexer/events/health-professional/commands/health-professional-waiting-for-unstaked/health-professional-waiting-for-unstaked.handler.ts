import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { HealthProfessionalWaitingForUnstakedCommandIndexer } from './health-professional-waiting-for-unstaked.command';

@Injectable()
@CommandHandler(HealthProfessionalWaitingForUnstakedCommandIndexer)
export class HealthProfessionalWaitingForUnstakedHandler
  implements
    ICommandHandler<HealthProfessionalWaitingForUnstakedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(
    command: HealthProfessionalWaitingForUnstakedCommandIndexer,
  ): Promise<any> {
    const { accountId, status, moment, blockMetaData } = command;

    await this.elasticsearchService.update({
      id: accountId,
      index: 'health-professional',
      refresh: 'wait_for',
      body: {
        doc: {
          stake_status: status,
          unstaked_at: Number(moment.split(',').join('')),
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
