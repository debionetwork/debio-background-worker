import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { HealthProfessionalQualificationCreatedCommandIndexer } from './health-professional-qualification-created.command';

@Injectable()
@CommandHandler(HealthProfessionalQualificationCreatedCommandIndexer)
export class HealthProfessionalQualificationCreatedHandler
  implements
    ICommandHandler<HealthProfessionalQualificationCreatedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(
    command: HealthProfessionalQualificationCreatedCommandIndexer,
  ): Promise<any> {
    const {
      healthProfessionalQualification: { id, owner, info },
      blockMetaData,
    } = command;

    await this.elasticsearchService.create({
      id: id,
      index: 'health-professional-qualifications',
      refresh: 'wait_for',
      body: {
        id: id,
        owner: owner,
        info: {
          experiences: info.experiences,
          certifications: info.certifications,
        },
        blockMetaData: blockMetaData,
      },
    });

    await this.elasticsearchService.update({
      index: 'health-professional',
      id: owner,
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
            id: id,
            qualification: command.healthProfessionalQualification,
          },
        },
      },
    });
  }
}
