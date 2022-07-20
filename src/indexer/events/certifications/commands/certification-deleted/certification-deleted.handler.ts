import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CertificationDeletedCommandIndexer } from './certification-deleted.command';

@Injectable()
@CommandHandler(CertificationDeletedCommandIndexer)
export class CertificationDeletedHandler
  implements ICommandHandler<CertificationDeletedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: CertificationDeletedCommandIndexer) {
    const { certification } = command;

    await this.elasticsearchService.delete({
      index: 'certifications',
      id: certification.id,
      refresh: 'wait_for',
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
              ctx._source.certifications.remove(params.index);
              ctx._source.certifications_ids.remove(ctx._source.certifications_ids.indexOf(params.id))
            }
          `,
          params: {
            id: certification.id,
            index: certificationIndexToDelete,
          },
        },
      },
    });
  }
}
