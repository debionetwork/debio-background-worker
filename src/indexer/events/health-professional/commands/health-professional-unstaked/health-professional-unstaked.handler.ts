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
    const { accountId, balance, status, moment, blockMetaData } = command;

    await this.elasticsearchService.update({
      id: accountId,
      index: 'health-professional',
      refresh: 'wait_for',
      body: {
        doc: {
          stake_amount: balance,
          stake_status: status,
          unstaked_at: Number(moment.split(',').join('')),
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
