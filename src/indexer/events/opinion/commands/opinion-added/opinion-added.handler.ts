import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { OpinionAddedCommandIndexer } from './opinion-added.command';

@Injectable()
@CommandHandler(OpinionAddedCommandIndexer)
export class OpinionAddedHandler
  implements ICommandHandler<OpinionAddedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: OpinionAddedCommandIndexer) {
    const {
      opinion: {
        id,
        requestor_id,
        professional_id,
        info: { description, myriad_url, asset_id, currency, amount },
        status,
        created_at,
      },
      blockMetaData,
    } = command;

    await this.elasticsearchService.create({
      index: 'opinion',
      id: id,
      refresh: 'wait_for',
      body: {
        id: id,
        requestor_id: requestor_id,
        professional_id: professional_id,
        info: {
          description: description,
          myriad_url: myriad_url,
          asset_id: asset_id,
          currency: currency,
          amount: amount,
        },
        status: status,
        created_at: created_at,
        blockMetaData: blockMetaData,
      },
    });
  }
}
