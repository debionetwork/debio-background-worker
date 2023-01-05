import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { OpinionRequestedCommandIndexer } from './opinion-requested.command';

@Injectable()
@CommandHandler(OpinionRequestedCommandIndexer)
export class OpinionRequestedHandler
  implements ICommandHandler<OpinionRequestedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: OpinionRequestedCommandIndexer) {
    const {
      opinionRequestor: {
        id,
        account_id,
        info: {
          category,
          description,
          genetic_data_ids,
          opinion_ids,
          myriad_url,
        },
        created_at,
        updated_at,
      },
      blockMetaData,
    } = command;

    await this.elasticsearchService.create({
      index: 'opinion-requestor',
      id: id,
      refresh: 'wait_for',
      body: {
        id: id,
        account_id: account_id,
        info: {
          category: category,
          description: description,
          genetic_data_ids: genetic_data_ids,
          opinion_ids: opinion_ids,
          myriad_url: myriad_url,
        },
        created_at: created_at,
        updated_at: updated_at,
        blockMetaData: blockMetaData,
      },
    });
  }
}
