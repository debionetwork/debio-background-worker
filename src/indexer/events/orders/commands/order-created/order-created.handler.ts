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
      service_id: order.serviceId,
      customer_id: order.customerId,
      customer_box_public_key: order.customerBoxPublicKey,
      seller_id: order.sellerId,
      dna_sample_tracking_id: order.dnaSampleTrackingId,
      currency: order.currency,
      prices: order.prices,
      additional_prices: order.additionalPrices,
      status: order.status,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
      lab_info: {},
      service_info: {},
      order_flow: order.orderFlow,
      blockMetaData: command.blockMetaData,
    };

    const lab = await this.elasticsearchService.search({
      index: 'labs',
      body: {
        query: {
          match: { _id: order.sellerId.toString() },
        },
      },
    });

    const lab_info = lab.body.hits.hits[0]._source.info;

    const service = await this.elasticsearchService.search({
      index: 'services',
      body: {
        query: {
          match: { _id: order.serviceId.toString() },
        },
      },
    });

    const service_info = service.body.hits.hits[0]._source.info;

    orderBody.lab_info = lab_info;
    orderBody.service_info = service_info;

    return this.elasticsearchService
      .index({
        index: 'orders',
        refresh: 'wait_for',
        id: order.id,
        body: {
          ...orderBody,
        },
      })
      .catch((error) => {
        throw error;
      });
  }
}
