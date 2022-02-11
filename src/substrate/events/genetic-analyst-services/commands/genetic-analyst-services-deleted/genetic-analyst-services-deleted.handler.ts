import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalystServicesDeletedCommand } from './genetic-analyst-services-deleted.command';

@Injectable()
@CommandHandler(GeneticAnalystServicesDeletedCommand)
export class GeneticAnalystServicesDeletedHandler
  implements ICommandHandler<GeneticAnalystServicesDeletedCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalystServicesDeletedCommand) {
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
    const { _source } = resp.body.hits.hits[0];
    serviceIndexToDelete = _source.services.findIndex(
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
            index: serviceIndexToDelete
          }
        }
      }
    });
  }
}
