import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LabDeregisteredCommandIndexer } from './lab-deregistered.command';

@Injectable()
@CommandHandler(LabDeregisteredCommandIndexer)
export class LabDeregisteredHandler
  implements ICommandHandler<LabDeregisteredCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: LabDeregisteredCommandIndexer) {
    const { labs: lab } = command;
    await this.elasticsearchService.delete({
      index: 'labs',
      id: lab.accountId,
      refresh: 'wait_for',
    });

    if (lab.services.length > 0) {
      await this.elasticsearchService.deleteByQuery({
        index: 'services',
        refresh: true,
        allow_no_indices: true,
        body: {
          query: {
            match: {
              owner_id: lab.accountId,
            },
          },
        },
      });
    }
  }
}
