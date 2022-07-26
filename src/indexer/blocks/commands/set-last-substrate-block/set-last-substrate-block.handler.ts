import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SetLastSubstrateBlockCommandIndexer } from './set-last-substrate-block.command';

@Injectable()
@CommandHandler(SetLastSubstrateBlockCommandIndexer)
export class SetLastSubstrateBlockHandler
  implements ICommandHandler<SetLastSubstrateBlockCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: SetLastSubstrateBlockCommandIndexer) {
    await this.elasticsearchService.index({
      index: 'last-block-number-substrate',
      id: 'last-block-number-substrate',
      refresh: 'wait_for',
      body: {
        last_block_number: command.blockNumber,
      },
    });
  }
}
