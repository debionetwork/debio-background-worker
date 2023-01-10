import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { OpinionRequestorInfoUpdatedCommandIndexer } from './opinion-requestor-info-updated.command';

@Injectable()
@CommandHandler(OpinionRequestorInfoUpdatedCommandIndexer)
export class OpinionRequestorInfoUpdatedHandler
  implements ICommandHandler<OpinionRequestorInfoUpdatedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: OpinionRequestorInfoUpdatedCommandIndexer) {
    const {
      requestorId,
      requestorInfo: {
        category,
        description,
        genetic_data_ids,
        opinion_ids,
        myriad_url,
      },
      blockMetaData,
    } = command;

    await this.elasticsearchService.update({
      index: 'opinion-requestor',
      id: requestorId,
      refresh: 'wait_for',
      body: {
        doc: {
          info: {
            category: category,
            description: description,
            genetic_data_ids: genetic_data_ids,
            opinion_ids: opinion_ids,
            myriad_url: myriad_url,
          },
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
