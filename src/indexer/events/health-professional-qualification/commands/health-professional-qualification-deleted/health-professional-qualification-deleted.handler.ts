import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { HealthProfessionalQualificationDeletedCommandIndexer } from './health-professional-qualification-deleted.command';

@Injectable()
@CommandHandler(HealthProfessionalQualificationDeletedCommandIndexer)
export class HealthProfessionalQualificationDeletedHandler
  implements
    ICommandHandler<HealthProfessionalQualificationDeletedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(
    command: HealthProfessionalQualificationDeletedCommandIndexer,
  ): Promise<any> {
    const { id } = command;

    const qualificationInfo = await this.elasticsearchService.search({
      index: 'health-professional-qualifications',
      body: {
        query: {
          match: { _id: id },
        },
      },
    });

    await this.elasticsearchService.delete({
      id: id,
      index: 'health-professional-qualifications',
      refresh: 'wait_for',
    });

    const owner = qualificationInfo.body.hits.hits[0]._source.owner;

    let qualificationIndexToDelete = -1;

    const resp = await this.elasticsearchService.search({
      index: 'health-professional',
      body: {
        query: {
          match: { _id: owner },
        },
      },
    });
    const qualifications =
      resp.body?.hits?.hits[0]?._source?.qualifications || [];
    qualificationIndexToDelete = qualifications.findIndex((c) => c.id == id);

    await this.elasticsearchService.update({
      index: 'genetic-analysts',
      id: owner,
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
            id: id,
            index: qualificationIndexToDelete,
          },
        },
      },
    });
  }
}
