import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RequestClaimedCommand } from './request-claimed.command';

@Injectable()
@CommandHandler(RequestClaimedCommand)
export class RequestClaimedHandler
  implements ICommandHandler<RequestClaimedCommand>
{
  constructor(private readonly elasticSearchService: ElasticsearchService) {}

  async execute(command: RequestClaimedCommand) {
    await this.elasticSearchService.update({
      index: 'create-service-request',
      id: command.request.request_hash,
      refresh: 'wait_for',
      body: {
        script: {
          lang: 'painless',
          source: `
                        ctx._source.request.lab_address.add(params.lab_address);
                        ctx._source.request.request_status: params.status;
                        ctx._source.blockMetadata = params.blockMetaData;
                    `,
          params: {
            lab_address: command.request.lab_address,
            status: '1',
            blockMetaData: command.blockMetadata,
          },
        },
      },
    });
  }
}
