import { Injectable } from '@nestjs/common';
import { CommandHandler, IQueryHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GetLastBlockQuery } from './get-last-block.query';

@Injectable()
@CommandHandler(GetLastBlockQuery)
export class GetLastBlockHandler
  implements IQueryHandler<GetLastBlockQuery>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute() {
    const { body } = await this.elasticsearchService.search({
      index: 'last-block-number',
    });
    return body.hits.hits[0]._source.last_block_number;
  }
}
