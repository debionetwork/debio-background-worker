import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { OpinionUpdatedCommandIndexer } from './opinion-updated.command';

@Injectable()
@CommandHandler(OpinionUpdatedCommandIndexer)
export class OpinionUpdatedHandler
  implements ICommandHandler<OpinionUpdatedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: OpinionUpdatedCommandIndexer) {
    const {
      opinion: { info, id },
      blockMetaData,
    } = command;

    await this.elasticsearchService.update({
      index: 'opinion',
      id: id,
      refresh: 'wait_for',
      body: {
        doc: {
          info: {
            ...info,
          },
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
