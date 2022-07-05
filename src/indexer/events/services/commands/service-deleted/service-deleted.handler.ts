import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceDeletedCommand } from './service-deleted.command';
import { Logger } from '@nestjs/common';

@Injectable()
@CommandHandler(ServiceDeletedCommand)
export class ServiceDeletedHandler
  implements ICommandHandler<ServiceDeletedCommand>
{
  private readonly logger: Logger = new Logger(ServiceDeletedHandler.name);
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: ServiceDeletedCommand) {
    const { services: service } = command;

    try {
      await this.elasticsearchService.delete({
        index: 'services',
        id: service.id,
        refresh: 'wait_for',
      });
    } catch (err) {
      this.logger.log('elasticsearchService.delete services error', err);
    }

    let serviceIndexToDelete = -1;

    const resp = await this.elasticsearchService.search({
      index: 'labs',
      body: {
        query: {
          match: { _id: service.ownerId },
        },
      },
    });
    const services = resp.body?.hits?.hits[0]?._source?.services || [];
    serviceIndexToDelete = services.findIndex((s) => s.id == service.id);

    await this.elasticsearchService.update({
      index: 'labs',
      id: service.ownerId.toString(),
      refresh: 'wait_for',
      body: {
        script: {
          lang: 'painless',
          source: `if(ctx._source.services_ids.contains(params.id)) { 
            ctx._source.services.remove(params.index);
            ctx._source.services_ids.remove(ctx._source.services_ids.indexOf(params.id));
          }`,
          params: {
            id: service.id,
            index: serviceIndexToDelete,
          },
        },
      },
    });
  }
}
