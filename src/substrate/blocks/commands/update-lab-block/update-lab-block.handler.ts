import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { UpdateLabBlockCommand } from './update-lab-block.command';

@Injectable()
@CommandHandler(UpdateLabBlockCommand)
export class UpdateLabBlockHandler
  implements ICommandHandler<UpdateLabBlockCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: UpdateLabBlockCommand) {
    await this.elasticsearchService.update({
      index: 'update-lab',
      id: command.labs.account_id,
      refresh: 'wait_for',
      body: {
				doc: {
					block_number: command.blockNumber,
					account_id: command.labs.account_id,
					services: command.labs.services,
					certifications: command.labs.certifications,
					info: command.labs.info,
				},
				doc_as_upsert: true,
      },
    });
  }
}
