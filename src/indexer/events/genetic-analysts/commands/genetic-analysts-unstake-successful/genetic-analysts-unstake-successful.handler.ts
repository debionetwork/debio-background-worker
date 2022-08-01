import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalystUnstakeSuccessfulCommandIndexer } from './genetic-analysts-unstake-successful.command';

@Injectable()
@CommandHandler(GeneticAnalystUnstakeSuccessfulCommandIndexer)
export class GeneticAnalystUnstakeSuccessfulHandler
  implements ICommandHandler<GeneticAnalystUnstakeSuccessfulCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalystUnstakeSuccessfulCommandIndexer) {
    const { geneticAnalystsModel, blockMetaData } = command;

    await this.elasticsearchService.update({
      index: 'genetic-analysts',
      id: geneticAnalystsModel.account_id,
      refresh: 'wait_for',
      body: {
        doc: {
          stake_amount: geneticAnalystsModel.stake_amount,
          stake_status: geneticAnalystsModel.stake_status,
          blockMetaData: blockMetaData,
          unstake_at: geneticAnalystsModel.unstake_at,
        },
      },
    });
  }
}
