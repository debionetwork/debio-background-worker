import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { HealthProfessionalRegisteredCommandIndexer } from './health-professional-registered.command';

@Injectable()
@CommandHandler(HealthProfessionalRegisteredCommandIndexer)
export class HealthProfessionalRegisteredHandler
  implements ICommandHandler<HealthProfessionalRegisteredCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(
    command: HealthProfessionalRegisteredCommandIndexer,
  ): Promise<any> {
    const { accountId, healthProfessional, blockMetaData } = command;

    await this.elasticsearchService.create({
      id: accountId,
      index: 'health-professional',
      refresh: 'wait_for',
      body: {
        ...healthProfessional,
        blockMetaData: blockMetaData,
      },
    });
  }
}
