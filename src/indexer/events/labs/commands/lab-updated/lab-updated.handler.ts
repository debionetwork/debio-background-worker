import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LabUpdatedCommandIndexer } from './lab-updated.command';

@Injectable()
@CommandHandler(LabUpdatedCommandIndexer)
export class LabUpdatedHandler
  implements ICommandHandler<LabUpdatedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: LabUpdatedCommandIndexer) {
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
