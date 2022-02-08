import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { AddGeneticDataCommand } from './add-genetic-data.command';

@Injectable()
@CommandHandler(AddGeneticDataCommand)
export class AddGeneticDataHandler
  implements ICommandHandler<AddGeneticDataCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: AddGeneticDataCommand) {
    const { geneticData, blockMetaData } = command;

    await this.elasticsearchService.index({
      index: 'genetic-data',
      id: geneticData.id,
      refresh: 'wait_for',
      body: {
        id: geneticData.id,
        owner_id: geneticData.ownerId,
        title: geneticData.title,
        description: geneticData.description,
        report_link: geneticData.reportLink,
        blockMetaData: blockMetaData,
      },
    });
  }
}
