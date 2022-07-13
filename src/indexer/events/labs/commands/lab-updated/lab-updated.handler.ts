import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LabUpdatedCommand } from './lab-updated.command';

@Injectable()
@CommandHandler(LabUpdatedCommand)
export class LabUpdatedHandler implements ICommandHandler<LabUpdatedCommand> {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: LabUpdatedCommand) {
    const { accountId, info } = command.labs;
    await this.elasticsearchService.update({
      index: 'labs',
      id: accountId,
      refresh: 'wait_for',
      body: {
        script: {
          lang: 'painless',
          source: `
            ctx._source.account_id = params.account_id;
            ctx._source.info = params.info;
            ctx._source.blockMetaData = params.blockMetaData;
          `,
          params: {
            account_id: accountId,
            info: info,
            blockMetaData: command.blockMetaData,
          },
        },
      },
    });
  }
}
