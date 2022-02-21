import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalystsStakeSuccessfulCommand } from './genetic-analysts-stake-successful.command';

@Injectable()
@CommandHandler(GeneticAnalystsStakeSuccessfulCommand)
export class GeneticAnalystsStakeSuccessfulHandler
  implements ICommandHandler<GeneticAnalystsStakeSuccessfulCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalystsStakeSuccessfulCommand) {
    const { geneticAnalystsModel, blockMetaData } = command;

    await this.elasticsearchService.update({
      index: 'genetic-analysts',
      id: geneticAnalystsModel.account_id,
      refresh: 'wait_for',
      body: {
        doc: {
          stake_status: geneticAnalystsModel.stake_status,
          stake_amount: geneticAnalystsModel.stake_amount,
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
