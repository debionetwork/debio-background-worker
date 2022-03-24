import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalystsUpdateVerificationStatusCommand } from './genetic-analysts-update-verification-status.command';

@Injectable()
@CommandHandler(GeneticAnalystsUpdateVerificationStatusCommand)
export class GeneticAnalystsUpdateVerificationStatusHandler
  implements ICommandHandler<GeneticAnalystsUpdateVerificationStatusCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalystsUpdateVerificationStatusCommand) {
    const { geneticAnalystsModel, blockMetaData } = command;

    await this.elasticsearchService.update({
      index: 'genetic-analysts',
      id: geneticAnalystsModel.account_id,
      refresh: 'wait_for',
      body: {
        doc: {
          verification_status: geneticAnalystsModel.verification_status,
          stake_amount: geneticAnalystsModel.stake_amount,
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
