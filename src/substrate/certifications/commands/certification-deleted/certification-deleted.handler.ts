import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CertificationDeletedCommand } from './certification-deleted.command';

@Injectable()
@CommandHandler(CertificationDeletedCommand)
export class CertificationDeletedHandler
  implements ICommandHandler<CertificationDeletedCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}
  
  async execute(command: CertificationDeletedCommand) {
    const { certification } = command;

    await this.elasticsearchService.delete({
      index: 'certifications',
      id: certification.id,
      refresh: 'wait_for',
    });


    await this.elasticsearchService.update({
      index: 'labs',
      refresh: 'wait_for',
      id: certification.owner_id,
      body: {
        script: {
          lang: 'painless',
          source: `
            for(int i = 0; i < ctx._source.certifications.length; i++) {
              if (ctx._source.certifications[i].id == params.id) {
                ctx._source.certifications.remove(i);
                break;
              }
            }
          `,
          params: {
            id: certification.id
          },
        }
      }
    });
  }
}