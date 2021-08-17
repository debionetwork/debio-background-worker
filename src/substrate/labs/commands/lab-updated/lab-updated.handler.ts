import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LabUpdatedCommand } from './lab-updated.command';

@Injectable()
@CommandHandler(LabUpdatedCommand)
export class LabUpdatedHandler implements ICommandHandler<LabUpdatedCommand> {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: LabUpdatedCommand) {
    const { labs: lab } = command;
    await this.elasticsearchService.update({
      index: 'labs',
      id: lab.account_id,
      body: {
        doc: {
          account_id: lab.account_id,
          services: lab.services,
          certifications: lab.certifications,
          info: lab.info,
        },
      },
    });
  }
}
