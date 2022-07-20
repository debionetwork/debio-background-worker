import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalystsQualificationDeletedCommandIndexer } from './genetic-analysts-qualification-deleted.command';

@Injectable()
@CommandHandler(GeneticAnalystsQualificationDeletedCommandIndexer)
export class GeneticAnalystsQualificationDeletedHandler
  implements ICommandHandler<GeneticAnalystsQualificationDeletedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalystsQualificationDeletedCommandIndexer) {
    const { geneticAnalystsQualificationModel } = command;

    await this.elasticsearchService.delete({
      index: 'genetic-analysts-qualification',
      id: geneticAnalystsQualificationModel.id,
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
              ctx._source.qualifications.remove(params.index);
              ctx._source.qualifications_ids.remove(ctx._source.qualifications_ids.indexOf(params.id));
            }
          `,
          params: {
            id: geneticAnalystsQualificationModel.id,
            index: qualificationIndexToDelete,
          },
        },
      },
    });
  }
}
