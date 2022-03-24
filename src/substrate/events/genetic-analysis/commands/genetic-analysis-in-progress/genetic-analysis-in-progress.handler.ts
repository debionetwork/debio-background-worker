import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalysisInProgressCommand } from './genetic-analysis-in-progress.command';

@Injectable()
@CommandHandler(GeneticAnalysisInProgressCommand)
export class GeneticAnalysisInProgressHandler
  implements ICommandHandler<GeneticAnalysisInProgressCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalysisInProgressCommand) {
    const { geneticAnalysisModel, blockMetaData } = command;

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
