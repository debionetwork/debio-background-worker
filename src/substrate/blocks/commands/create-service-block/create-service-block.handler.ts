import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CreateServiceBlockCommand } from './create-service-block.command';

@Injectable()
@CommandHandler(CreateServiceBlockCommand)
export class CreateServiceBlockHandler
  implements ICommandHandler<CreateServiceBlockCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: CreateServiceBlockCommand) {
    await this.elasticsearchService.update({
      index: 'create-service',
      id: command.services.id,
      refresh: 'wait_for',
      body: {
				doc: {
					block_number: command.blockNumber,
					id: command.services.id,
					owner_id: command.services.ownerId,
					info: command.services.info,
				},
				doc_as_upsert: true,
      },
    });
  }
}
