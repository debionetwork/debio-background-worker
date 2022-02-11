import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RequestStatus } from '../../models/requestStatus';
import { FinalizedServiceRequestCommand } from './finalized-service-request.command';

@Injectable()
@CommandHandler(FinalizedServiceRequestCommand)
export class FinalizedServiceRequestHandler
  implements ICommandHandler<FinalizedServiceRequestCommand>
{
  constructor(private readonly elasticSearchService: ElasticsearchService) {}

  async execute(command: FinalizedServiceRequestCommand) {
    await this.elasticSearchService.update({
      index: 'create-service-request',
      id: command.serviceInvoice.requestHash,
      refresh: 'wait_for',
      body: {
        script: {
          lang: 'painless',
          source: `
            ctx._source.request.lab_address = params.lab_address;
            ctx._source.request.status      = params.status;
            ctx._source.blockMetadata       = params.blockMetaData;
          `,
          params: {
            lab_address: command.serviceInvoice.sellerAddress,
            status: RequestStatus.Finalized,
            blockMetaData: command.blockMetaData,
          },
        },
      },
    });
  }
}
