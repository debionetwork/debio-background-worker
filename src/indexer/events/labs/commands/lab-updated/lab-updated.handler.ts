import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LabUpdatedCommand } from './lab-updated.command';

@Injectable()
@CommandHandler(LabUpdatedCommand)
export class LabUpdatedHandler implements ICommandHandler<LabUpdatedCommand> {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: LabUpdatedCommand) {
    const {
      labs: { accountId, info },
      blockMetaData,
    } = command;
    await this.elasticsearchService.update({
      index: 'labs',
      id: accountId,
      refresh: 'wait_for',
      body: {
        doc: {
          info: info,
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
