import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { AddGeneticDataCommandIndexer } from './add-genetic-data.command';

@Injectable()
@CommandHandler(AddGeneticDataCommandIndexer)
export class AddGeneticDataHandler
  implements ICommandHandler<AddGeneticDataCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: AddGeneticDataCommandIndexer) {
    const { geneticData, blockMetaData } = command;

    await this.elasticsearchService.index({
      index: 'genetic-data',
      id: geneticData.id,
      refresh: 'wait_for',
      body: {
        id: geneticData.id,
        owner_id: geneticData.owner_id,
        title: geneticData.title,
        description: geneticData.description,
        report_link: geneticData.report_link,
        blockMetaData: blockMetaData,
      },
    });
  }
}
