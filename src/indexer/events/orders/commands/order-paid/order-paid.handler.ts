import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderPaidCommandIndexer } from './order-paid.command';

@Injectable()
@CommandHandler(OrderPaidCommandIndexer)
export class OrderPaidHandler
  implements ICommandHandler<OrderPaidCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: OrderPaidCommandIndexer) {
    const { orders: order } = command;

    return await this.elasticsearchService.update({
      index: 'orders',
      refresh: 'wait_for',
      id: order.id,
      body: {
        doc: {
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
          order_flow: order.orderFlow,
          transaction_hash: command.blockMetaData.blockHash,
          blockMetaData: command.blockMetaData,
        },
      },
    });
  }
}
