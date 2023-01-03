import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { HealthProfessionalVerificationStatusCommandIndexer } from './health-professional-verification-status-updated.command';

@Injectable()
@CommandHandler(HealthProfessionalVerificationStatusCommandIndexer)
export class HealthProfessionalVerificationStatusHandler
  implements
    ICommandHandler<HealthProfessionalVerificationStatusCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(
    command: HealthProfessionalVerificationStatusCommandIndexer,
  ): Promise<any> {
    const { accountId, verificationStatus, blockMetaData } = command;

    await this.elasticsearchService.update({
      id: accountId,
      index: 'health-professional',
      refresh: 'wait_for',
      body: {
        doc: {
          availability_status: verificationStatus,
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
