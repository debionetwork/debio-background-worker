import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { DeleteServiceBlockCommand } from './delete-service-block.command';

@Injectable()
@CommandHandler(DeleteServiceBlockCommand)
export class DeleteServiceBlockHandler
  implements ICommandHandler<DeleteServiceBlockCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: DeleteServiceBlockCommand) {
    await this.elasticsearchService.update({
      index: 'delete-service',
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
