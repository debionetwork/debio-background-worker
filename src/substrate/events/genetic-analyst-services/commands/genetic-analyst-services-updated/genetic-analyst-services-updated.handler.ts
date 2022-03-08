import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalystServicesUpdatedCommand } from './genetic-analyst-services-updated.command';

@Injectable()
@CommandHandler(GeneticAnalystServicesUpdatedCommand)
export class GeneticAnalystServicesUpdatedHandler
  implements ICommandHandler<GeneticAnalystServicesUpdatedCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalystServicesUpdatedCommand) {
    const { geneticAnalystsServicesModel, blockMetaData } = command;

    await this.elasticsearchService.update({
      index: 'genetic-analysts-services',
      id: geneticAnalystsServicesModel.id,
      refresh: 'wait_for',
      body: {
        doc: {
          info: geneticAnalystsServicesModel.info,
          blockMetaData: blockMetaData,
        },
      },
    });

    let serviceIndexToDelete = -1;

    const resp = await this.elasticsearchService.search({
      index: 'genetic-analysts',
      body: {
        query: {
          match: { _id: geneticAnalystsServicesModel.owner_id },
        },
      },
    });
    const services = resp.body?.hits?.hits[0]?._source?.services || [];
    serviceIndexToDelete = services.findIndex(
      (c) => c.id == geneticAnalystsServicesModel.id,
    );

    await this.elasticsearchService.update({
      index: 'genetic-analysts',
      id: geneticAnalystsServicesModel.owner_id,
      refresh: 'wait_for',
      body: {
        script: {
          lang: 'painless',
          source: `
            if (ctx._source.services_ids.contains(params.id)) {
              ctx._source.services[params.index] = params.qualification;
            }
          `,
          params: {
            id: geneticAnalystsServicesModel.id,
            index: serviceIndexToDelete,
            qualification: geneticAnalystsServicesModel,
          },
        },
      },
    });
  }
}
