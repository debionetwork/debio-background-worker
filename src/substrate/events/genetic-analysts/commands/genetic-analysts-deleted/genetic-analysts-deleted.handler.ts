import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalystsDeletedCommand } from './genetic-analysts-deleted.command';

@Injectable()
@CommandHandler(GeneticAnalystsDeletedCommand)
export class GeneticAnalystsDeletedHandler
  implements ICommandHandler<GeneticAnalystsDeletedCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalystsDeletedCommand) {
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
