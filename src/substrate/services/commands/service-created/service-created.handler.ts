import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceCreatedCommand } from './service-created.command';

@Injectable()
@CommandHandler(ServiceCreatedCommand)
export class ServiceCreatedHandler implements ICommandHandler<ServiceCreatedCommand> {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: ServiceCreatedCommand) {
    const { services: service } = command;
    await this.elasticsearchService.index({
      index: 'services',
      id: service.id,
      body: {
        id: service.id,
        owner_id: service.owner_id,
        info: service.info
      }
    });

    await this.elasticsearchService.update({
      index: 'labs',
      id: service.owner_id,
      body: {
        script: {
          lang: "painless",
          source: "ctx._source.services.add(params.id);",
          params: {
            id: service.id 
          }
        }
      }
    });
  }
}