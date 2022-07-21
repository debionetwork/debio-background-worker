import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalystServicesCreatedCommandIndexer } from './genetic-analyst-services-created.command';

@Injectable()
@CommandHandler(GeneticAnalystServicesCreatedCommandIndexer)
export class GeneticAnalystServicesCreatedHandler
  implements ICommandHandler<GeneticAnalystServicesCreatedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalystServicesCreatedCommandIndexer) {
    const { geneticAnalystsServicesModel, blockMetaData } = command;

    await this.elasticsearchService.index({
      index: 'genetic-analysts-services',
      id: geneticAnalystsServicesModel.id,
      refresh: 'wait_for',
      body: {
        id: geneticAnalystsServicesModel.id,
        owner_id: geneticAnalystsServicesModel.owner_id,
        info: geneticAnalystsServicesModel.info,
        blockMetaData: blockMetaData,
      },
    });

    await this.elasticsearchService.update({
      index: 'genetic-analysts',
      id: geneticAnalystsServicesModel.owner_id,
      refresh: 'wait_for',
      body: {
        script: {
          lang: 'painless',
          source: `
            if (!ctx._source.services_ids.contains(params.id)) {
              ctx._source.services_ids.add(params.id);
              ctx._source.services.add(params.service);
            }
          `,
          params: {
            id: geneticAnalystsServicesModel.id,
            service: geneticAnalystsServicesModel,
          },
        },
      },
    });
  }
}
