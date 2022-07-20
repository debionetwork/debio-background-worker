import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RemoveGeneticDataCommandIndexer } from './remove-genetic-data.command';

@Injectable()
@CommandHandler(RemoveGeneticDataCommandIndexer)
export class RemoveGeneticDataHandler
  implements ICommandHandler<RemoveGeneticDataCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: RemoveGeneticDataCommandIndexer) {
    const { geneticData } = command;

    await this.elasticsearchService.delete({
      index: 'genetic-data',
      id: geneticData.id,
    });
  }
}
