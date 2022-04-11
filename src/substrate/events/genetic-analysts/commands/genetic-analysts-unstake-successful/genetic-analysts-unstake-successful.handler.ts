import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalystUnstakeSuccessfulCommand } from './genetic-analysts-unstake-successful.command';

@Injectable()
@CommandHandler(GeneticAnalystUnstakeSuccessfulCommand)
export class GeneticAnalystUnstakeSuccessfulHandler
  implements ICommandHandler<GeneticAnalystUnstakeSuccessfulCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalystUnstakeSuccessfulCommand) {
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
      },
    });
  }
}
