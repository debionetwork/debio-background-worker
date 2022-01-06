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
          blockMetaData: command.blockMetaData
        }
      }
    });

    await this.elasticsearchService.update({
      index: 'labs',
      refresh: 'wait_for',
      id: certification.owner_id,
      body: {
        script: {
          lang: 'painless',
          source: `ctx._source.certifications[params.index] = params.certification_body;`,
          params: {
            index: certification.id,
            certification_body: certification,
          },
        }
      }
    });
  }
}