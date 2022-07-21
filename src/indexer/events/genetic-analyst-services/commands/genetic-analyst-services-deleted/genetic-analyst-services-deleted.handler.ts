import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalystServicesDeletedCommandIndexer } from './genetic-analyst-services-deleted.command';

@Injectable()
@CommandHandler(GeneticAnalystServicesDeletedCommandIndexer)
export class GeneticAnalystServicesDeletedHandler
  implements ICommandHandler<GeneticAnalystServicesDeletedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalystServicesDeletedCommandIndexer) {
    const { geneticAnalystsServicesModel } = command;

    await this.elasticsearchService.delete({
      index: 'genetic-analysts-services',
      id: geneticAnalystsServicesModel.id,
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
              ctx._source.services.remove(params.index);
              ctx._source.services_ids.remove(ctx._source.qualifications_ids.indexOf(params.id));
            }
          `,
          params: {
            id: geneticAnalystsServicesModel.id,
            index: serviceIndexToDelete,
          },
        },
      },
    });
  }
}
