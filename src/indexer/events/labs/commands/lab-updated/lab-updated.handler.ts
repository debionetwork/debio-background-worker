import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LabUpdatedCommand } from './lab-updated.command';

@Injectable()
@CommandHandler(LabUpdatedCommand)
export class LabUpdatedHandler implements ICommandHandler<LabUpdatedCommand> {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: LabUpdatedCommand) {
    const { labs: lab } = command;
    await this.elasticsearchService.update({
      index: 'labs',
      id: lab.accountId,
      refresh: 'wait_for',
      body: {
        script: {
          lang: 'painless',
          source: `
            ctx._source.account_id = params.account_id;
            ctx._source.certifications = params.certifications;
            ctx._source.info = params.info;
            ctx._source.blockMetaData = params.blockMetaData;
            ctx._source.verification_status = params.verification_status;
          `,
          params: {
            account_id: lab.accountId,
            certifications: lab.certifications,
            verification_status: lab.verificationStatus,
            info: lab.info,
            blockMetaData: command.blockMetaData,
          },
        },
      },
    });
  }
}
