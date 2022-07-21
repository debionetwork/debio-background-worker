import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalysisSubmittedCommandIndexer } from './genetic-analysis-submitted.command';

@Injectable()
@CommandHandler(GeneticAnalysisSubmittedCommandIndexer)
export class GeneticAnalysisSubmittedHandler
  implements ICommandHandler<GeneticAnalysisSubmittedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalysisSubmittedCommandIndexer) {
    const { geneticAnalysisModel, blockMetaData } = command;

    await this.elasticsearchService.index({
      index: 'genetic-analysis',
      id: geneticAnalysisModel.genetic_analyst_id,
      refresh: 'wait_for',
      body: {
        genetic_analysis_tracking_id:
          geneticAnalysisModel.genetic_analysis_tracking_id,
        genetic_analyst_id: geneticAnalysisModel.genetic_analyst_id,
        owner_id: geneticAnalysisModel.owner_id,
        report_link: geneticAnalysisModel.report_link,
        comment: geneticAnalysisModel.comment,
        rejected_title: geneticAnalysisModel.rejected_title,
        rejected_description: geneticAnalysisModel.rejected_description,
        genetic_analysis_order_id:
          geneticAnalysisModel.genetic_analysis_order_id,
        created_at: geneticAnalysisModel.created_at,
        updated_at: geneticAnalysisModel.updated_at,
        status: geneticAnalysisModel.status,
        blockMetaData: blockMetaData,
      },
    });
  }
}
