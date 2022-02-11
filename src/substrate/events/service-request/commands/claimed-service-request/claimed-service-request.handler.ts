import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RequestStatus } from '../../models/requestStatus';
import { ClaimedServiceRequestCommand } from './claimed-service-request.command';

@Injectable()
@CommandHandler(ClaimedServiceRequestCommand)
export class ClaimedServiceRequestHandler
  implements ICommandHandler<ClaimedServiceRequestCommand>
{
  constructor(private readonly elasticSearchService: ElasticsearchService) {}

  async execute(command: ClaimedServiceRequestCommand) {
    await this.elasticSearchService.update({
      index: 'create-service-request',
      id: command.claimRequest.requestHash,
      refresh: 'wait_for',
      body: {
        script: {
          lang: 'painless',
          source: `
            ctx._source.request.lab_address = params.lab_address;
            ctx._source.request.status      =  params.status;
            ctx._source.blockMetadata       = params.blockMetaData;
          `,
          params: {
            lab_address: command.claimRequest.labAddress,
            status: RequestStatus.Claimed,
            blockMetaData: command.blockMetadata,
          },
        },
      },
    });
  }
}
