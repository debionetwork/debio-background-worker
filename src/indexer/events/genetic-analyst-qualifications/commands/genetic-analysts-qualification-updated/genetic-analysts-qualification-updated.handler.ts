import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalystsQualificationUpdatedCommandIndexer } from './genetic-analysts-qualification-updated.command';

@Injectable()
@CommandHandler(GeneticAnalystsQualificationUpdatedCommandIndexer)
export class GeneticAnalystsQualificationUpdatedHandler
  implements ICommandHandler<GeneticAnalystsQualificationUpdatedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalystsQualificationUpdatedCommandIndexer) {
    const { geneticAnalystsQualificationModel, blockMetaData } = command;

    await this.elasticsearchService.update({
      index: 'genetic-analysts-qualification',
      id: geneticAnalystsQualificationModel.id,
      refresh: 'wait_for',
      body: {
        doc: {
          info: geneticAnalystsQualificationModel.info,
          blockMetaData: blockMetaData,
        },
      },
    });

    let qualificationIndexToDelete = -1;

    const resp = await this.elasticsearchService.search({
      index: 'genetic-analysts',
      body: {
        query: {
          match: { _id: geneticAnalystsQualificationModel.owner_id },
        },
      },
    });
    const qualifications =
      resp.body?.hits?.hits[0]?._source?.qualifications || [];
    qualificationIndexToDelete = qualifications.findIndex(
      (c) => c.id == geneticAnalystsQualificationModel.id,
    );

    await this.elasticsearchService.update({
      index: 'genetic-analysts',
      id: geneticAnalystsQualificationModel.owner_id,
      refresh: 'wait_for',
      body: {
        script: {
          lang: 'painless',
          source: `
            if (ctx._source.qualifications_ids.contains(params.id)) {
              ctx._source.qualifications[params.index] = params.qualification;
            }
          `,
          params: {
            id: geneticAnalystsQualificationModel.id,
            index: qualificationIndexToDelete,
            qualification: geneticAnalystsQualificationModel,
          },
        },
      },
    });
  }
}
