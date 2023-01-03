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
    const {
      accountId,
      healthProfessional: { stake_status, stake_amount },
      blockMetaData,
    } = command;

    await this.elasticsearchService.create({
      id: accountId,
      index: 'health-professional',
      refresh: 'wait_for',
      body: {
        stake_amount: stake_amount,
        stake_status: stake_status,
        blockMetaData: blockMetaData,
      },
    });
  }
}
