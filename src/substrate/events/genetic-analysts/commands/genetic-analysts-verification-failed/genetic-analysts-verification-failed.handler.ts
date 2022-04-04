import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalystVerificationFailedCommand } from './genetic-analysts-verification-failed.command';

@Injectable()
@CommandHandler(GeneticAnalystVerificationFailedCommand)
export class GeneticAnalystVerificationFailedHandler
  implements ICommandHandler<GeneticAnalystVerificationFailedCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalystVerificationFailedCommand) {
    const { geneticAnalystsModel, blockMetaData } = command;

    await this.elasticsearchService.update({
      index: 'genetic-analysts',
      id: geneticAnalystsModel.account_id,
      refresh: 'wait_for',
      body: {
        verification_status: geneticAnalystsModel.verification_status,
        stake_amount: geneticAnalystsModel.stake_amount,
        blockMetaData: blockMetaData,
      },
    });
  }
}