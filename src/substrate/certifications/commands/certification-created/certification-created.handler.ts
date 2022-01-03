import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CertificationCreatedCommand } from './certification-created.command';

@Injectable()
@CommandHandler(CertificationCreatedCommand)
export class CertificationCreatedHandler
  implements ICommandHandler<CertificationCreatedCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: CertificationCreatedCommand) {
    const { certification } = command;

    await this.elasticsearchService.index({
      index: 'certifications',
      refresh: 'wait_for',
      op_type: 'create',
      id: certification.id,
      body: {
        id: certification.id,
        owner_id: certification.owner_id,
        info: certification.info,
        blockMetaData: command.blockMetaData
      }
    });

    await this.elasticsearchService.update({
      index: 'labs',
      refresh: 'wait_for',
      id: certification.owner_id,
      body: {
        script: {
          lang: 'painless',
          source: 'if (ctx._source.certifications.contains(params)) { ctx._source.certifications.add(params); }',
          params: {
            ...certification,
          },
        }
      }
    });
  }
}