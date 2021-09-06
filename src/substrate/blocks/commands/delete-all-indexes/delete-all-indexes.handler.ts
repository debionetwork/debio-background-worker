import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { DeleteAllIndexesCommand } from './delete-all-indexes.command';

@Injectable()
@CommandHandler(DeleteAllIndexesCommand)
export class DeleteAllIndexesHandler
  implements ICommandHandler<DeleteAllIndexesCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute() {
    return this.elasticsearchService.indices.delete({
        index: ['labs', 'services'],
        ignore_unavailable: true
    });
  }
}
