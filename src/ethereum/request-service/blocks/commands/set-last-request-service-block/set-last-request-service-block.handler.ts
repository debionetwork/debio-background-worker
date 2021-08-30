import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SetLastRequestServiceBlockCommand } from './set-last-request-service-block.command';

@Injectable()
@CommandHandler(SetLastRequestServiceBlockCommand)
export class SetLastRequestServiceBlockHandler
  implements ICommandHandler<SetLastRequestServiceBlockCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: SetLastRequestServiceBlockCommand) {
    await this.elasticsearchService.index({
      index: 'last-block-number-request-service',
      id: 'last-block-number-request-service',
      refresh: 'wait_for',
      body: {
        last_block_number: command.blockNumber,
      },
    });
  }
}
