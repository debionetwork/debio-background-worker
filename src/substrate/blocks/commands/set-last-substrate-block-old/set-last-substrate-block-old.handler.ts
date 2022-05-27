import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SetLastSubstrateBlockOldCommand } from './set-last-substrate-block-old.command';

@Injectable()
@CommandHandler(SetLastSubstrateBlockOldCommand)
export class SetLastSubstrateBlockOldHandler
  implements ICommandHandler<SetLastSubstrateBlockOldCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: SetLastSubstrateBlockOldCommand) {
    await this.elasticsearchService.index({
      index: 'last-block-number-substrate-sync-old',
      id: 'last-block-number-substrate-sync-old',
      refresh: 'wait_for',
      body: {
        last_block_sync_old_number: command.blockNumber,
      },
    });
  }
}
