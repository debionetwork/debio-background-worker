import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalysisRejectedCommand } from './genetic-analysis-rejected.command';

@Injectable()
@CommandHandler(GeneticAnalysisRejectedCommand)
export class GeneticAnalysisRejectedHandler
  implements ICommandHandler<GeneticAnalysisRejectedCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalysisRejectedCommand) {
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
