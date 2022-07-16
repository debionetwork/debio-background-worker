import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { LabUpdateVerificationStatusCommand } from './lab-update-verification-status.command';

@Injectable()
@CommandHandler(LabUpdateVerificationStatusCommand)
export class LabUpdateVerificationStatusHandler
  implements ICommandHandler<LabUpdateVerificationStatusCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: LabUpdateVerificationStatusCommand) {
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
