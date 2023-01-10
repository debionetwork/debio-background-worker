import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { HealthProfessionalQualificationUpdatedCommandIndexer } from './health-professional-qualification-updated.command';

@Injectable()
@CommandHandler(HealthProfessionalQualificationUpdatedCommandIndexer)
export class HealthProfessionalQualificationUpdatedHandler
  implements
    ICommandHandler<HealthProfessionalQualificationUpdatedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(
    command: HealthProfessionalQualificationUpdatedCommandIndexer,
  ): Promise<any> {
    const {
      healthProfessionalQualification: { id, owner, info },
      blockMetaData,
    } = command;

    await this.elasticsearchService.update({
      id: id,
      index: 'health-professional-qualifications',
      refresh: 'wait_for',
      body: {
        doc: {
          id: id,
          owner: owner,
          info: {
            experiences: info.experiences,
            certifications: info.certifications,
          },
          blockMetaData: blockMetaData,
        },
      },
    });

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
      index: 'health-professional',
      id: owner,
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
            id: id,
            index: qualificationIndexToDelete,
            qualification: command.healthProfessionalQualification,
          },
        },
      },
    });
  }
}
