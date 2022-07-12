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
      id: lab.accountId,
      body: {
        account_id: lab.accountId,
        services: lab.services,
        services_ids: lab.services,
        certifications: lab.certifications,
        certifications_ids: lab.certifications,
        verification_status: lab.verificationStatus,
        info: lab.info,
        blockMetaData: command.blockMetaData,
      },
    });
  }
}
