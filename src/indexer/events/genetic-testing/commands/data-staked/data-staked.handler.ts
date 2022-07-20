import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { DataStakedCommandIndexer } from './data-staked.command';

@Injectable()
@CommandHandler(DataStakedCommandIndexer)
export class DataStakedHandler
  implements ICommandHandler<DataStakedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: DataStakedCommandIndexer) {
    await this.elasticsearchService.update({
      index: 'orders',
      id: command.dataStaked.orderId,
      refresh: 'wait_for',
      body: {
        doc: {
          bounty: true,
          hash_bounty: command.dataStaked.hashDataBounty,
        },
      },
    });

    await this.elasticsearchService.index({
      index: 'data-bounty',
      id: command.dataStaked.orderId,
      refresh: 'wait_for',
      body: {
        order_id: command.dataStaked.orderId,
        hash_data_bounty: command.dataStaked.hashDataBounty,
        blockMetaData: command.blockMetaData,
      },
    });
  }
}
