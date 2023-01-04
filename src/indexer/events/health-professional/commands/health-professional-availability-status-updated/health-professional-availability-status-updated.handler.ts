import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { HealthProfessionalAvailabilityStatusCommandIndexer } from './health-professional-availability-status-updated.command';

@Injectable()
@CommandHandler(HealthProfessionalAvailabilityStatusCommandIndexer)
export class HealthProfessionalAvailabilityStatusHandler
  implements
    ICommandHandler<HealthProfessionalAvailabilityStatusCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(
    command: HealthProfessionalAvailabilityStatusCommandIndexer,
  ): Promise<any> {
    const { accountId, availabilityStatus, blockMetaData } = command;

    await this.elasticsearchService.update({
      id: accountId,
      index: 'health-professional',
      refresh: 'wait_for',
      body: {
        doc: {
          availability_status: availabilityStatus,
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
