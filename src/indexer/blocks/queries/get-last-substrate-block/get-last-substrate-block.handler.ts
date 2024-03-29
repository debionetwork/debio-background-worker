import { Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GetLastSubstrateBlockQueryIndexer } from './get-last-substrate-block.query';

@Injectable()
@QueryHandler(GetLastSubstrateBlockQueryIndexer)
export class GetLastSubstrateBlockHandler
  implements IQueryHandler<GetLastSubstrateBlockQueryIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute() {
    const { body } = await this.elasticsearchService.search({
      index: 'last-block-number-substrate',
      allow_no_indices: true,
    });
    if (body.hits.hits[0]) {
      return body.hits.hits[0]._source.last_block_number;
    } else {
      return null;
    }
  }
}
