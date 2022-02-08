import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { UpdateGeneticDataCommand } from './update-genetic-data.command';

@Injectable()
@CommandHandler(UpdateGeneticDataCommand)
export class UpdateGeneticDataHandler
  implements ICommandHandler<UpdateGeneticDataCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: UpdateGeneticDataCommand) {
    const { geneticData, blockMetaData } = command;

    await this.elasticsearchService.update({
      index: 'genetic-data',
      id: geneticData.id,
      body: {
        doc: {
          owner_id: geneticData.ownerId,
          title: geneticData.title,
          description: geneticData.description,
          report_link: geneticData.reportLink,
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
