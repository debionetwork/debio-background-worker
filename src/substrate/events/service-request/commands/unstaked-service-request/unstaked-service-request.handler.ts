import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RequestStatus } from '../../models/requestStatus';
import { UnstakedServiceRequestCommand } from './unstaked-service-request.command';

@Injectable()
@CommandHandler(UnstakedServiceRequestCommand)
export class UnstakedServiceRequestHandler
  implements ICommandHandler<UnstakedServiceRequestCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: UnstakedServiceRequestCommand) {
    await this.elasticsearchService.update({
      index: 'create-service-request',
      id: command.request.hash,
      refresh: 'wait_for',
      body: {
        doc: {
          request: {
            status: RequestStatus.Unstaked,
            updated_at: command.request.updated_at,
            unstaked_at: command.request.unstaked_at,
          },
          blockMetadata: command.blockMetaData,
        },
      },
    });

    await this.elasticsearchService.update({
      index: 'country-service-request',
      id: command.request.country,
      refresh: 'wait_for',
      body: {
        script: {
          lang: 'painless',
          source: `
            def services = ctx._source.service_request
            for (int i = 0; i < services.length; i++) {
              if (services[i].id == params.id) {
                ctx._source.service_request.remove(i);
                break;
              }
            }
          `,
          params: {
            id: command.request.hash,
          },
        },
        upsert: {
          counter: 1
        },
      },
    });
  }
}
