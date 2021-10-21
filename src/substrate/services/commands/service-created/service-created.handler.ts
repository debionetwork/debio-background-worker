import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceCreatedCommand } from './service-created.command';

@Injectable()
@CommandHandler(ServiceCreatedCommand)
export class ServiceCreatedHandler
  implements ICommandHandler<ServiceCreatedCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: ServiceCreatedCommand) {
    const { services: service } = command;
    const resp = await this.elasticsearchService.search({
      index: 'labs',
      body: {
        query: {
          match: { _id: service.owner_id.toString() },
        },
      },
    });

    let serviceBody = {
      id: service.id,
      owner_id: service.owner_id,
      info: service.info,
      country: '',
      city: '',
      region: '',
      blockMetaData: command.blockMetaData,
    };

    try {
      const { _source } = resp.body.hits.hits[0];
      const { info } = _source;
      const { country, city, region } = info;
      serviceBody = {
        ...serviceBody,
        country,
        city,
        region
      };

      await this.elasticsearchService.index({
        index: 'services',
        id: service.id,
        refresh: 'wait_for',
        body: {
          ...serviceBody,
        },
      });

      await this.elasticsearchService.update({
        index: 'labs',
        id: service.owner_id,
        refresh: 'wait_for',
        body: {
          script: {
            lang: 'painless',
            source: 'ctx._source.services.add(params);',
            params: {
              ...serviceBody,
            },
          },
        },
      });
    } catch (err) {
      console.log("[this.elasticsearchService.update({index: 'labs', })]", err);
    }
  }
}
