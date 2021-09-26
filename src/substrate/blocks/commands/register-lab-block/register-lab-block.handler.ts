import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RegisterLabBlockCommand } from './register-lab-block.command';

@Injectable()
@CommandHandler(RegisterLabBlockCommand)
export class RegisterLabBlockHandler
  implements ICommandHandler<RegisterLabBlockCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: RegisterLabBlockCommand) {
    await this.elasticsearchService.update({
      index: 'register-lab',
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
