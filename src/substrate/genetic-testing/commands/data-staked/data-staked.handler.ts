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
          match: { _id: command.dataStaked.orderId },
        },
      },
    });

    await this.elasticsearchService.update({
      index: 'orders',
      id: command.dataStaked.orderId,
      refresh: 'wait_for',
      body: {
        doc: {
          bounty: true,
        }
      }
    });
  }
}