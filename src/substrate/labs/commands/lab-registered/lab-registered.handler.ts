import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LabRegisteredCommand } from './lab-registered.command';

@Injectable()
@CommandHandler(LabRegisteredCommand)
export class LabRegisteredHandler
  implements ICommandHandler<LabRegisteredCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: LabRegisteredCommand) {
    const { labs: lab } = command;
    await this.elasticsearchService.index({
      index: 'labs',
      refresh: 'wait_for',
      id: lab.account_id,
      body: {
        account_id: lab.account_id,
        services: lab.services,
        certifications: lab.certifications,
        verification_status: lab.verification_status,
        info: lab.info,
        blockMetaData: command.blockMetaData,
      },
    });
  }
}
