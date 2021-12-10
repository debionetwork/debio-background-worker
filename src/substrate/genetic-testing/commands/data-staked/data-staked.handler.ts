import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { DataStakedCommand } from "./data-staked.command";

@Injectable()
@CommandHandler(DataStakedCommand)
export class DataStakedHandler implements ICommandHandler<DataStakedCommand> {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: DataStakedCommand) {
    await this.elasticsearchService.update({
      index: 'orders',
      id: command.dataStaked.orderId,
      refresh: 'wait_for',
      body: {
        doc: {
          bounty: true,
          hash_bounty: command.dataStaked.hashDataBounty
        }
      }
    });
    
    await this.elasticsearchService.index({
      index: 'data-bounty',
      id: command.dataStaked.orderId,
      refresh: 'wait_for',
      body: {
          order_id: command.dataStaked.orderId,
          hash_data_bounty: command.dataStaked.hashDataBounty,
          blockMetaData: command.blockMetaData,
      }
    });
  }
}