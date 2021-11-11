import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { FulfillOrderBlockCommand } from './fulfill-order-block.command';

@Injectable()
@CommandHandler(FulfillOrderBlockCommand)
export class FulfillOrderBlockHandler
  implements ICommandHandler<FulfillOrderBlockCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: FulfillOrderBlockCommand) {
    await this.elasticsearchService.update({
      index: 'fulfill-order',
      id: command.order.id,
      refresh: 'wait_for',
      body: {
        doc: {
					block_number: command.blockNumber,
					id: command.order.id,
					service_id: command.order.serviceId,
					customer_id: command.order.customerId,
					customer_box_public_key: command.order.customerBoxPublicKey,
					seller_id: command.order.sellerId,
					dna_sample_tracking_id: command.order.dnaSampleTrackingId,
					currency: command.order.currency,
					prices: command.order.prices,
					additional_prices: command.order.additionalPrices,
					status: command.order.status,
					created_at: command.order.createdAt,
					updated_at: command.order.updatedAt,
        },
				doc_as_upsert: true,
      },
    });
  }
}
