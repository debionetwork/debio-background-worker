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
      refresh: 'wait_for',
      body: {
        doc: {
          account_id: lab.account_id,
          certifications: lab.certifications,
          info: lab.info,
        },
      },
    });

    await this.elasticsearchService.updateByQuery({
      index: 'orders',
      body: {
        query: {
          match: { 
            seller_id: lab.account_id.toString(),
          }
        },
        script: {
          source: "ctx._source.lab_info = params.new_lab_info",
          lang: 'painless',
          params: {
            new_lab_info: lab.info
          }
        }
      }
    });
  }
}
