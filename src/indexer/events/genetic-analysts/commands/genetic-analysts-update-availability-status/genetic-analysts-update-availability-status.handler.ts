import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalystsUpdateAvailabilityStatusCommandIndexer } from './genetic-analysts-update-availability-status.command';

@Injectable()
@CommandHandler(GeneticAnalystsUpdateAvailabilityStatusCommandIndexer)
export class GeneticAnalystsUpdateAvailabilityStatusHandler
  implements
    ICommandHandler<GeneticAnalystsUpdateAvailabilityStatusCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(
    command: GeneticAnalystsUpdateAvailabilityStatusCommandIndexer,
  ) {
    const { geneticAnalystsModel, blockMetaData } = command;

    await this.elasticsearchService.update({
      index: 'genetic-analysts',
      id: geneticAnalystsModel.account_id,
      refresh: 'wait_for',
      body: {
        doc: {
          availability_status: geneticAnalystsModel.availability_status,
          stake_amount: geneticAnalystsModel.stake_amount,
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
