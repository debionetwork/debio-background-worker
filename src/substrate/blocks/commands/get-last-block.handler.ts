import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GetLastBlockCommand } from './get-last-block.command';

@Injectable()
@CommandHandler(GetLastBlockCommand)
export class GetLastBlockHandler
  implements ICommandHandler<GetLastBlockCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute() {
    const { body } = await this.elasticsearchService.search({
      index: 'last-block-number',
    });
    return body.hits.hits[0]._source.last_block_number;
  }
}
