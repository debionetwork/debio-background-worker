import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalysisResultReadyCommand } from './genetic-analysis-result-ready.command';

@Injectable()
@CommandHandler(GeneticAnalysisResultReadyCommand)
export class GeneticAnalysisResultReadyHandler
  implements ICommandHandler<GeneticAnalysisResultReadyCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalysisResultReadyCommand) {
    const { geneticAnalysisModel, blockMetaData } = command;

    await this.elasticsearchService.update({
      index: 'genetic-analysis',
      id: geneticAnalysisModel.genetic_analyst_id,
      body: {
        doc: {
          genetic_analysis_tracking_id:
            geneticAnalysisModel.genetic_analysis_tracking_id,
          genetic_analysis_order_id:
            geneticAnalysisModel.genetic_analysis_order_id,
          updated_at: geneticAnalysisModel.updated_at,
          status: geneticAnalysisModel.status,
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
