import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CreateServiceRequestCommandIndexer } from './create-service-request.command';

@Injectable()
@CommandHandler(CreateServiceRequestCommandIndexer)
export class CreateServiceRequestHandler
  implements ICommandHandler<CreateServiceRequestCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: CreateServiceRequestCommandIndexer) {
    await this.elasticsearchService.create({
      index: 'create-service-request',
      id: command.request.hash,
      refresh: 'wait_for',
      body: {
        request: command.request,
        blockMetadata: command.blockMetadata,
      },
    });

    const { body } = await this.elasticsearchService.search({
      index: 'country-service-request',
      body: {
        query: {
          match: {
            _id: command.request.country,
          },
        },
      },
    });
    
    const countHits = body?.hits?.hits?.length || 0;

    if (countHits > 0) {
      await this.elasticsearchService.update({
        index: 'country-service-request',
        id: command.request.country,
        refresh: 'wait_for',
        body: {
          script: {
            lang: 'painless',
            source: `
              if (ctx._source.containsKey('service_request')) {
                ctx._source.service_request.add(params.service_request);
              }
            `,
            params: {
              service_request: {
                id: command.request.hash,
                region: command.request.region,
                city: command.request.city,
                requester: command.request.requester_address,
                category: command.request.service_category,
                amount: command.request.staking_amount,
              },
            },
          },
          doc_as_upsert: false,
        },
      });
    } else {
      await this.elasticsearchService.index({
        index: 'country-service-request',
        id: command.request.country,
        refresh: 'wait_for',
        body: {
          country: command.request.country,
          service_request: [
            {
              id: command.request.hash,
              region: command.request.region,
              city: command.request.city,
              requester: command.request.requester_address,
              category: command.request.service_category,
              amount: command.request.staking_amount,
            },
          ],
        },
      });
    }
  }
}
