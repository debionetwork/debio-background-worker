import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderCreatedCommand } from './order-created.command';

@Injectable()
@CommandHandler(OrderCreatedCommand)
export class OrderCreatedHandler
  implements ICommandHandler<OrderCreatedCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: OrderCreatedCommand) {
    const { orders: order } = command;

		const orderBody = {
			id: order.id,
			service_id: order.service_id,
			customer_id: order.customer_id,
			customer_box_public_key: order.customer_box_public_key,
			seller_id: order.seller_id,
			dna_sample_tracking_id: order.dna_sample_tracking_id,
			currency: order.currency,
			prices: order.prices,
			additional_prices: order.additional_prices,
			status: order.status,
			created_at: order.created_at.toString(),
			updated_at: order.updated_at.toString(),
			lab_info: {},
			service_info: {},
      order_flow: order.order_flow,
      blockMetaData: command.blockMetaData,
		};

    const lab = await this.elasticsearchService.search({
      index: 'labs',
      body: {
        query: {
          match: { _id: order.seller_id.toString() },
        },
      },
    });
    
    const lab_info = lab.body.hits.hits[0]._source.info;

    const service = await this.elasticsearchService.search({
      index: 'services',
      body: {
        query: {
          match: { _id: order.service_id.toString() },
        },
      },
    });

    const service_info = service.body.hits.hits[0]._source.info;
    
		orderBody.lab_info = lab_info;
		orderBody.service_info = service_info;

    return this.elasticsearchService.index({
      index: 'orders',
      refresh: 'wait_for',
      id: order.id,
      body: {
        ...orderBody
      },
    }).catch((error) => {
      throw(error)
    });
  }
}