import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalystsDeletedCommandIndexer } from './genetic-analysts-deleted.command';

@Injectable()
@CommandHandler(GeneticAnalystsDeletedCommandIndexer)
export class GeneticAnalystsDeletedHandler
  implements ICommandHandler<GeneticAnalystsDeletedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalystsDeletedCommandIndexer) {
    const { geneticAnalystsModel } = command;

    await this.elasticsearchService.delete({
      index: 'genetic-analysts',
      id: geneticAnalystsModel.account_id,
    });

    if (geneticAnalystsModel.services.length > 0) {
      await this.elasticsearchService.deleteByQuery({
        index: 'genetic-analysts-services',
        refresh: true,
        allow_no_indices: true,
        body: {
          query: {
            match: {
              owner_id: geneticAnalystsModel.account_id,
            },
          },
        },
      });
    }

    if (geneticAnalystsModel.qualifications.length > 0) {
      await this.elasticsearchService.deleteByQuery({
        index: 'genetic-analysts-qualification',
        refresh: true,
        allow_no_indices: true,
        body: {
          query: {
            match: {
              owner_id: geneticAnalystsModel.account_id,
            },
          },
        },
      });
    }
  }
}
