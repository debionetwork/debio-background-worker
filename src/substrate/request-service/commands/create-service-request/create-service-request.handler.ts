import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CreateServiceRequestCommand } from './create-service-request.command';

@Injectable()
@CommandHandler(CreateServiceRequestCommand)
export class CreateServiceRequestHandler
  implements ICommandHandler<CreateServiceRequestCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: CreateServiceRequestCommand) {
    await this.elasticsearchService.index({
      index: 'create-service-request',
      id: command.request.hash,
      refresh: 'wait_for',
      body: {
        request: command.request,
        blockMetadata: command.blockMetadata,
      },
    });
  }
}
