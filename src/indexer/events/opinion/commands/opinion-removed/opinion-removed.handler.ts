import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { OpinionRemovedCommandIndexer } from './opinion-removed.command';

@Injectable()
@CommandHandler(OpinionRemovedCommandIndexer)
export class OpinionRemovedHandler
  implements ICommandHandler<OpinionRemovedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: OpinionRemovedCommandIndexer) {
    const { hash } = command;

    await this.elasticsearchService.delete({
      index: 'opinion',
      id: hash,
    });
  }
}
