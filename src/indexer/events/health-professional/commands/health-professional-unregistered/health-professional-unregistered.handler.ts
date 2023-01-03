import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { HealthProfessionalUnregisteredCommandIndexer } from './health-professional-unregistered.command';

@Injectable()
@CommandHandler(HealthProfessionalUnregisteredCommandIndexer)
export class HealthProfessionalUnregisteredHandler
  implements ICommandHandler<HealthProfessionalUnregisteredCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(
    command: HealthProfessionalUnregisteredCommandIndexer,
  ): Promise<any> {
    const { accountId } = command;

    await this.elasticsearchService.delete({
      id: accountId,
      index: 'health-professional',
      refresh: 'wait_for',
    });
  }
}
