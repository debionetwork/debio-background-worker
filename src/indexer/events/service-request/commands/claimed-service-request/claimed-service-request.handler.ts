import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RequestStatus } from '../../../../models/service-request/requestStatus';
import { ClaimedServiceRequestCommand } from './claimed-service-request.command';

@Injectable()
@CommandHandler(ClaimedServiceRequestCommand)
export class ClaimedServiceRequestHandler
  implements ICommandHandler<ClaimedServiceRequestCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: ClaimedServiceRequestCommand) {
    await this.elasticsearchService.update({
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

    const { body } = await this.elasticsearchService.search({
      index: 'create-service-request',
      body: {
        query: {
          match: { _id: command.claimRequest.requestHash },
        },
      },
    });

    const service_request = body.hits?.hits[0]?._source || null;

    if (service_request !== null) {
      await this.updateCountryServiceRequest(
        service_request.request.country,
        service_request.request.hash,
      );
    }
  }

  async updateCountryServiceRequest(id: string, hash: string) {
    await this.elasticsearchService.update({
      index: 'country-service-request',
      id: id,
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
            id: hash,
          },
        },
      },
    });
  }
}
