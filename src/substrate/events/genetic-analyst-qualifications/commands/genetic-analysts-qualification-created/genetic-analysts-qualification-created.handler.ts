import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalystsQualificationCreatedCommand } from './genetic-analysts-qualification-created.command';

@Injectable()
@CommandHandler(GeneticAnalystsQualificationCreatedCommand)
export class GeneticAnalystsQualificationCreatedHandler
  implements ICommandHandler<GeneticAnalystsQualificationCreatedCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalystsQualificationCreatedCommand) {
    const { geneticAnalystsQualificationModel, blockMetaData } = command;

    await this.elasticsearchService.index({
      index: 'genetic-analysts-qualification',
      id: geneticAnalystsQualificationModel.id,
      refresh: 'wait_for',
      body: {
        id: geneticAnalystsQualificationModel.id,
        owner_id: geneticAnalystsQualificationModel.owner_id,
        info: geneticAnalystsQualificationModel.info,
        blockMetaData: blockMetaData,
      },
    });

    await this.elasticsearchService.update({
      index: 'genetic-analysts',
      id: geneticAnalystsQualificationModel.owner_id,
      refresh: 'wait_for',
      body: {
        script: {
          lang: 'painless',
          source: `
            if (!ctx._source.qualifications_ids.contains(params.id)) {
              ctx._source.qualifications_ids.add(params.id);
              ctx._source.qualifications.add(params.qualification);
            }
          `,
          params: {
            id: geneticAnalystsQualificationModel.id,
            qualification: geneticAnalystsQualificationModel
          }
        }
      }
    });
  }
}
