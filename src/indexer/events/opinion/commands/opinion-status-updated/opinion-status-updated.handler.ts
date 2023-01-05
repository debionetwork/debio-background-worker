import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { OpinionStatusUpdatedCommandIndexer } from './opinion-status-updated.command';

@Injectable()
@CommandHandler(OpinionStatusUpdatedCommandIndexer)
export class OpinionStatusUpdatedHandler
  implements ICommandHandler<OpinionStatusUpdatedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: OpinionStatusUpdatedCommandIndexer) {
    const { hash, status, blockMetaData } = command;

    await this.elasticsearchService.update({
      index: 'opinion',
      id: hash,
      refresh: 'wait_for',
      body: {
        doc: {
          status: status,
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
