import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RequestStatus } from '../../../../models/service-request/requestStatus';
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
      retry_on_conflict: 1,
      body: {
        script: {
          lang: 'painless',
          source: `
            for (int i = 0; i < ctx._source.service_request.length; i++) {
              if (ctx._source.service_request[i].id == params.id) {
                ctx._source.service_request.remove(i);
                break;
              }
            }
          `,
          params: {
            id: command.request.hash,
          },
        },
      },
    });
  }
}
