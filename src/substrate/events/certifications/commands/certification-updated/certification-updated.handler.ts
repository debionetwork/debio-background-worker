import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CertificationUpdatedCommand } from './certification-updated.command';

@Injectable()
@CommandHandler(CertificationUpdatedCommand)
export class CertificationUpdatedHandler
  implements ICommandHandler<CertificationUpdatedCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: CertificationUpdatedCommand) {
    const { certification } = command;

    await this.elasticsearchService.update({
      index: 'certifications',
      refresh: 'wait_for',
      id: certification.id,
      body: {
        doc: {
          id: certification.id,
          owner_id: certification.owner_id,
          info: certification.info,
          blockMetaData: command.blockMetaData,
        },
      },
    });

    let certificationIndexToDelete = -1;

    const resp = await this.elasticsearchService.search({
      index: 'labs',
      body: {
        query: {
          match: { _id: certification.owner_id },
        },
      },
    });
    const certifications =
      resp.body?.hits?.hits[0]?._source?.certifications || [];
    certificationIndexToDelete = certifications.findIndex(
      (c) => c.id == certification.id,
    );

    await this.elasticsearchService.update({
      index: 'labs',
      refresh: 'wait_for',
      id: certification.owner_id,
      body: {
        script: {
          lang: 'painless',
          source: `
            if (ctx._source.certifications_ids.contains(params.id)) {
              ctx._source.certifications[params.index] = params.certification;
            }
          `,
          params: {
            id: certification.id,
            index: certificationIndexToDelete,
            certification: certification,
          },
        },
      },
    });
  }
}
