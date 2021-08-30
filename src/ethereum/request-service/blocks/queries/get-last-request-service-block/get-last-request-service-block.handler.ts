import { Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GetLastRequestServiceBlockQuery } from './get-last-request-service-block.query';

@Injectable()
@QueryHandler(GetLastRequestServiceBlockQuery)
export class GetLastRequestServiceBlockHandler
  implements IQueryHandler<GetLastRequestServiceBlockQuery>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute() {
    const { body } = await this.elasticsearchService.search({
      index: 'last-block-number-request-service',
    });
    return body.hits.hits[0]._source.last_block_number;
  }
}
