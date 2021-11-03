import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { DataStakedCommand } from "./data-staked.command";

@Injectable()
@CommandHandler(DataStakedCommand)
export class DataStakedHandler implements ICommandHandler<DataStakedCommand> {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: DataStakedCommand) {
    const orders = await this.elasticsearchService.search({
      index: 'orders',
      body: {
        query: {
          match: { _id: command.dataStaked.order_id },
        },
      },
    });

    const order = orders.body.hits.hits[0]._source;

    await this.elasticsearchService.index({
      index: 'data-bounty',
      id: command.dataStaked.order_id,
      refresh: 'wait_for',
      body: {
          order_id: command.dataStaked.order_id,
          hash_data_bounty: command.dataStaked.hash_data_bounty,
          from: command.dataStaked.from,
          info: {
            service_id: order.service_id,
            service_name: order.service_info.name,
            category: order.service_info.category,
            description: order.service_info.description,
            long_description: order.service_info.long_description,
            lab_name: order.lab_info.name,
          },
          blockMetaData: command.blockMetaData,
      }
    });

    await this.elasticsearchService.update({
      index: 'orders',
      id: command.dataStaked.order_id,
      refresh: 'wait_for',
      body: {
        doc: {
          bounty: true,
        }
      }
    });
  }
}