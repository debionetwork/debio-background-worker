import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { UpdateServiceBlockCommand } from './update-service-block.command';

@Injectable()
@CommandHandler(UpdateServiceBlockCommand)
export class UpdateServiceBlockHandler
  implements ICommandHandler<UpdateServiceBlockCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: UpdateServiceBlockCommand) {
    await this.elasticsearchService.update({
      index: 'update-service',
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
