import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { OpinionAddedCommandIndexer } from './opinion-added.command';

@Injectable()
@CommandHandler(OpinionAddedCommandIndexer)
export class OpinionAddedHandler
  implements ICommandHandler<OpinionAddedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: OpinionAddedCommandIndexer) {
    const { opinion, blockMetaData } = command;

    await this.elasticsearchService.create({
      index: 'opinion',
      id: opinion.id,
      refresh: 'wait_for',
      body: {
        ...opinion,
        blockMetaData: blockMetaData,
      },
    });
  }
}
