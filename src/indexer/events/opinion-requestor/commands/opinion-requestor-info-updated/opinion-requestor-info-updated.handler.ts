import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { OpinionRequestorInfoUpdatedCommandIndexer } from './opinion-requestor-info-updated.command';

@Injectable()
@CommandHandler(OpinionRequestorInfoUpdatedCommandIndexer)
export class OpinionRequestorInfoUpdatedHandler
  implements ICommandHandler<OpinionRequestorInfoUpdatedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: OpinionRequestorInfoUpdatedCommandIndexer) {
    const { opinionRequestor, blockMetaData } = command;

    await this.elasticsearchService.update({
      index: 'opinion-requestor',
      id: opinionRequestor.id,
      refresh: 'wait_for',
      body: {
        doc: {
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
