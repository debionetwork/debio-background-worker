import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalystsUpdatedCommandIndexer } from './genetic-analysts-updated.command';

@Injectable()
@CommandHandler(GeneticAnalystsUpdatedCommandIndexer)
export class GeneticAnalystsUpdatedHandler
  implements ICommandHandler<GeneticAnalystsUpdatedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalystsUpdatedCommandIndexer) {
    const { geneticAnalystsModel, blockMetaData } = command;

    await this.elasticsearchService.update({
      index: 'genetic-analysts',
      id: geneticAnalystsModel.account_id,
      refresh: 'wait_for',
      body: {
        doc: {
          info: geneticAnalystsModel.info,
          stake_amount: geneticAnalystsModel.stake_amount,
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
