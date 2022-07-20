import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { UpdateGeneticDataCommandIndexer } from './update-genetic-data.command';

@Injectable()
@CommandHandler(UpdateGeneticDataCommandIndexer)
export class UpdateGeneticDataHandler
  implements ICommandHandler<UpdateGeneticDataCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: UpdateGeneticDataCommandIndexer) {
    const { geneticData, blockMetaData } = command;

    await this.elasticsearchService.update({
      index: 'genetic-data',
      id: geneticData.id,
      body: {
        doc: {
          owner_id: geneticData.owner_id,
          title: geneticData.title,
          description: geneticData.description,
          report_link: geneticData.report_link,
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
