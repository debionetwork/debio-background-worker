import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalysisRejectedCommandIndexer } from './genetic-analysis-rejected.command';

@Injectable()
@CommandHandler(GeneticAnalysisRejectedCommandIndexer)
export class GeneticAnalysisRejectedHandler
  implements ICommandHandler<GeneticAnalysisRejectedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalysisRejectedCommandIndexer) {
    const { geneticAnalysisModel, blockMetaData } = command;

    await this.elasticsearchService.update({
      index: 'genetic-analysis',
      id: geneticAnalysisModel.genetic_analyst_id,
      body: {
        doc: {
          rejected_title: geneticAnalysisModel.rejected_title,
          rejected_description: geneticAnalysisModel.rejected_description,
          updated_at: geneticAnalysisModel.updated_at,
          status: geneticAnalysisModel.status,
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
