import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { DeregisterLabBlockCommand } from './deregister-lab-block.command';

@Injectable()
@CommandHandler(DeregisterLabBlockCommand)
export class DeregisterLabBlockHandler
  implements ICommandHandler<DeregisterLabBlockCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: DeregisterLabBlockCommand) {
    await this.elasticsearchService.update({
      index: 'deregister-lab',
      id: command.labs.accountId,
      refresh: 'wait_for',
      body: {
				doc: {
					block_number: command.blockNumber,
					account_id: command.labs.accountId,
					services: command.labs.services,
					certifications: command.labs.certifications,
					info: command.labs.info,
				},
				doc_as_upsert: true,
      },
    });
  }
}
