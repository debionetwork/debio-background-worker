import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { LabUpdateVerificationStatusCommandIndexer } from './lab-update-verification-status.command';

@Injectable()
@CommandHandler(LabUpdateVerificationStatusCommandIndexer)
export class LabUpdateVerificationStatusHandler
  implements ICommandHandler<LabUpdateVerificationStatusCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: LabUpdateVerificationStatusCommandIndexer) {
    const {
      labs: { accountId, verificationStatus },
      blockMetaData,
    } = command;

    await this.elasticsearchService.update({
      index: 'labs',
      id: accountId,
      refresh: 'wait_for',
      body: {
        doc: {
          verification_status: verificationStatus,
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
