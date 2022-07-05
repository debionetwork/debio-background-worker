import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalystsRegisteredCommand } from './genetic-analysts-registered.command';

@Injectable()
@CommandHandler(GeneticAnalystsRegisteredCommand)
export class GeneticAnalystsRegisteredHandler
  implements ICommandHandler<GeneticAnalystsRegisteredCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalystsRegisteredCommand) {
    const { geneticAnalystsModel, blockMetaData } = command;

    await this.elasticsearchService.index({
      index: 'genetic-analysts',
      id: geneticAnalystsModel.account_id,
      refresh: 'wait_for',
      body: {
        account_id: geneticAnalystsModel.account_id,
        services: geneticAnalystsModel.services,
        qualifications: geneticAnalystsModel.qualifications,
        services_ids: [],
        qualifications_ids: [],
        info: geneticAnalystsModel.info,
        stake_amount: geneticAnalystsModel.stake_amount,
        stake_status: geneticAnalystsModel.stake_status,
        verification_status: geneticAnalystsModel.verification_status,
        availability_status: geneticAnalystsModel.availability_status,
        blockMetaData: blockMetaData,
        unstake_at: geneticAnalystsModel.unstake_at,
      },
    });
  }
}
