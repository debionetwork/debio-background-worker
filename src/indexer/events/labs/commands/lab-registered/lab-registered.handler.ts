import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LabRegisteredCommandIndexer } from './lab-registered.command';

@Injectable()
@CommandHandler(LabRegisteredCommandIndexer)
export class LabRegisteredHandler
  implements ICommandHandler<LabRegisteredCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: LabRegisteredCommandIndexer) {
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
