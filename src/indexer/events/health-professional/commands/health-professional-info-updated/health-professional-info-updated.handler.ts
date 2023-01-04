import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { HealthProfessionalInfoUpdatedCommandIndexer } from './health-professional-info-updated.command';

@Injectable()
@CommandHandler(HealthProfessionalInfoUpdatedCommandIndexer)
export class HealthProfessionalInfoUpdatedHandler
  implements ICommandHandler<HealthProfessionalInfoUpdatedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(
    command: HealthProfessionalInfoUpdatedCommandIndexer,
  ): Promise<any> {
    const { accountId, healthProfessionalInfo, blockMetaData } = command;

    await this.elasticsearchService.update({
      id: accountId,
      index: 'health-professional',
      refresh: 'wait_for',
      body: {
        doc: {
          info: {
            ...healthProfessionalInfo,
          },
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
