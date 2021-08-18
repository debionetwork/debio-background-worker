import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceDeletedCommand } from './service-deleted.command';

@Injectable()
@CommandHandler(ServiceDeletedCommand)
export class ServiceDeletedHandler
  implements ICommandHandler<ServiceDeletedCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: ServiceDeletedCommand) {
    const { services: service } = command;
    await this.elasticsearchService.delete({
      index: 'services',
      id: service.id,
      refresh: 'wait_for',
    });

    await this.elasticsearchService.update({
      index: 'labs',
      id: service.owner_id,
      refresh: 'wait_for',
      body: {
        script: {
          lang: 'painless',
          source:
            'ctx._source.services.remove(ctx._source.services.indexOf(params.id));',
          params: {
            id: service.id,
          },
        },
      },
    });
  }
}
