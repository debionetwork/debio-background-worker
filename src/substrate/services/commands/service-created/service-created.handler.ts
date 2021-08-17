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

    /**
     * FIXME:
     * Before indexing service data, need to retrieve its lab data
     * In order to get the lab's country and city.
     * Currently, when handling service created event in sync block,
     * There are cases where the lab data is not found
     */
    let resp;
    const maxRetries = 20;
    let tries = 0;
    while (tries < maxRetries) {
      tries += 1;
      resp = await this.elasticsearchService.search({
        index: 'labs',
        body: {
          query: {
            match: { _id: service.owner_id.toString() },
          },
        },
      });
      if (resp.body.hits.hits.length > 0) {
        break;
      }
    }

    let serviceBody = {
      id: service.id,
      owner_id: service.owner_id,
      info: service.info,
      country: '',
      city: '',
    };

    try {
      const { _source } = resp.body.hits.hits[0];
      const { info } = _source;
      const { country, city } = info;
      serviceBody = {
        ...serviceBody,
        country,
        city,
      };
    } catch (err) {
      console.log(err);
    }

    try {
      await this.elasticsearchService.index({
        index: 'services',
        id: service.id,
        body: {
          ...serviceBody,
        },
      });
    } catch (err) {
      console.log(err);
    }

    try {
      await this.elasticsearchService.update({
        index: 'labs',
        id: service.owner_id,
        body: {
          script: {
            lang: 'painless',
            source: 'ctx._source.services.add(params.id);',
            params: {
              id: service.id,
            },
          },
        },
        retry_on_conflict: 6,
      });
    } catch (err) {
      console.log("[this.elasticsearchService.update({index: 'labs', })]", err);
    }
  }
}
