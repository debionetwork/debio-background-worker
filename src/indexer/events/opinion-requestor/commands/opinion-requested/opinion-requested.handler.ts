import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { OpinionRequestedCommandIndexer } from './opinion-requested.command';

@Injectable()
@CommandHandler(OpinionRequestedCommandIndexer)
export class OpinionRequestedHandler
  implements ICommandHandler<OpinionRequestedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: OpinionRequestedCommandIndexer) {
    const { opinionRequestor, blockMetaData } = command;

    await this.elasticsearchService.create({
      index: 'opinion-requestor',
      id: opinionRequestor.id,
      refresh: 'wait_for',
      body: {
        ...opinionRequestor,
        blockMetaData: blockMetaData,
      },
    });
  }
}
