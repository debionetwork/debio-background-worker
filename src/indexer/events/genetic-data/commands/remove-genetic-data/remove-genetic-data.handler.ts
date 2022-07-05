import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RemoveGeneticDataCommand } from './remove-genetic-data.command';

@Injectable()
@CommandHandler(RemoveGeneticDataCommand)
export class RemoveGeneticDataHandler
  implements ICommandHandler<RemoveGeneticDataCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: RemoveGeneticDataCommand) {
    const { geneticData } = command;

    await this.elasticsearchService.delete({
      index: 'genetic-data',
      id: geneticData.id,
    });
  }
}
