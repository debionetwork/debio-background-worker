import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CancelOrderBlockCommand } from './cancel-order-block.command';

@Injectable()
@CommandHandler(CancelOrderBlockCommand)
export class CancelOrderBlockHandler
  implements ICommandHandler<CancelOrderBlockCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: CancelOrderBlockCommand) {		
    await this.elasticsearchService.update({
      index: 'cancel-order',
      id: command.order.id,
      refresh: 'wait_for',
      body: {
        doc: {
					block_number: command.blockNumber,
					id: command.order.id,
					service_id: command.order.service_id,
					customer_id: command.order.customer_id,
					customer_box_public_key: command.order.customer_box_public_key,
					seller_id: command.order.seller_id,
					dna_sample_tracking_id: command.order.dna_sample_tracking_id,
					currency: command.order.currency,
					prices: command.order.prices,
					additional_prices: command.order.additional_prices,
					status: command.order.status,
					created_at: command.order.created_at.toString(),
					updated_at: command.order.updated_at.toString(),
        },
				doc_as_upsert: true,
      },
    });
  }
}
