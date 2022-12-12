import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RequestStatus } from '../../../../models/service-request/request-status';
import { UpdateServiceRequestCommandIndexer } from './update-service-request.command';

@Injectable()
@CommandHandler(UpdateServiceRequestCommandIndexer)
export class UpdateServiceRequestHandler
  implements ICommandHandler<UpdateServiceRequestCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: UpdateServiceRequestCommandIndexer) {
    const { updateServiceRequest, request } = command;
    const { hash, status } = updateServiceRequest;

    await this.elasticsearchService.update({
      index: 'create-service-request',
      id: hash,
      refresh: 'wait_for',
      body: {
        script: {
          lang: 'painless',
          source: `
            ctx._source.request.status      = params.status;
            ctx._source.blockMetadata       = params.blockMetaData;
            ctx._source.request.updated_at  = params.updatedAt;
            ctx._source.request.unstaked_at = params.unstakedAt;
          `,
          params: {
            status: status,
            updatedAt: request.updated_at,
            unstakedAt: request.unstaked_at,
            blockMetaData: command.blockMetadata,
          },
        },
      },
    });

    const { body } = await this.elasticsearchService.search({
      index: 'create-service-request',
      body: {
        query: {
          match: { _id: hash },
        },
      },
    });

    const service_request = body.hits?.hits[0]?._source || null;

    if (service_request !== null && status !== RequestStatus.Unstaked) {
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
