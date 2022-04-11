import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalystsRetrieveUnstakeAmountCommand } from './genetic-analysts-retrieve-unstake-amount.command';

@Injectable()
@CommandHandler(GeneticAnalystsRetrieveUnstakeAmountCommand)
export class GeneticAnalystsRetrieveUnstakeAmountHandler
  implements ICommandHandler<GeneticAnalystsRetrieveUnstakeAmountCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalystsRetrieveUnstakeAmountCommand) {
    const { geneticAnalystsModel, blockMetaData } = command;

    await this.elasticsearchService.update({
      index: 'genetic-analysts',
      id: geneticAnalystsModel.account_id,
      refresh: 'wait_for',
      body: {
        stake_amount: geneticAnalystsModel.stake_amount,
        stake_status: geneticAnalystsModel.stake_status,
        blockMetaData: blockMetaData,
        unstake_at: geneticAnalystsModel.unstake_at,
        retrieve_unstake_at: geneticAnalystsModel.retrieve_unstake_at,
      },
    });
  }
}
