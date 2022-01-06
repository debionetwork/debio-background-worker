import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceUpdatedCommand } from './service-updated.command';

@Injectable()
@CommandHandler(ServiceUpdatedCommand)
export class ServiceUpdatedHandler
  implements ICommandHandler<ServiceUpdatedCommand>
{
  private readonly logger: Logger = new Logger(ServiceUpdatedHandler.name);
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: ServiceUpdatedCommand) {
    const { services: service } = command;

    await this.elasticsearchService.update({
      index: 'services',
      id: service.id,
      refresh: 'wait_for',
      body: {
        doc: {
          id: service.id,
          owner_id: service.ownerId,
          info: service.info,
          service_flow: service.serviceFlow,
          blockMetaData: command.blockMetaData,
        },
      },
    });

    let serviceBody = {
      id: service.id,
      owner_id: service.ownerId,
      info: service.info,
      service_flow: service.serviceFlow,
      country: '',
      city: '',
      region: '',
    };

    await this.elasticsearchService.update({
      index: 'labs',
      id: service.ownerId,
      refresh: 'wait_for',
      body: {
        script: {
          lang: 'painless',
          source: 'ctx._source.services[params.index] = params.service;',
          params: {
            index: service.id,
            service: serviceBody
          },
        },
      },
    });

    await this.elasticsearchService.updateByQuery({
      index: 'orders',
      ignore_unavailable: true,
      allow_no_indices: true,
      body: {
        script: {
          source: `ctx._source.service_info = params.new_service_info`,
          lang: 'painless',
          params: {
            new_service_info: service.info
          }
        },
        query: {
          match: { 
            service_id: service.id,
          }
        },
      }
    });
  }
}
