import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalysisInProgressCommandIndexer } from './genetic-analysis-in-progress.command';

@Injectable()
@CommandHandler(GeneticAnalysisInProgressCommandIndexer)
export class GeneticAnalysisInProgressHandler
  implements ICommandHandler<GeneticAnalysisInProgressCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalysisInProgressCommandIndexer) {
    const { geneticAnalysisModel, blockMetaData } = command;

    console.log('handler', geneticAnalysisModel, blockMetaData);

    await this.elasticsearchService.update({
      index: 'genetic-analysis',
      id: geneticAnalysisModel.genetic_analyst_id,
      body: {
        doc: {
          updated_at: geneticAnalysisModel.updated_at,
          status: geneticAnalysisModel.status,
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
