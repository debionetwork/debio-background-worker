import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SetLastBlockCommand } from './set-last-block.command';

@Injectable()
@CommandHandler(SetLastBlockCommand)
export class SetLastBlockHandler
  implements ICommandHandler<SetLastBlockCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: SetLastBlockCommand) {
    await this.elasticsearchService.index({
      index: 'last-block-number',
      id: 'last-block-number',
      body: {
        last_block_number: command.blockNumber,
      },
    });
  }
}
