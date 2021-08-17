import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceUpdatedCommand } from './service-updated.command';

@Injectable()
@CommandHandler(ServiceUpdatedCommand)
export class ServiceUpdatedHandler
  implements ICommandHandler<ServiceUpdatedCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: ServiceUpdatedCommand) {
    const { services: service } = command;
    await this.elasticsearchService.update({
      index: 'services',
      id: service.id,
      body: {
        doc: {
          id: service.id,
          owner_id: service.owner_id,
          info: service.info,
        },
      },
    });
  }
}
