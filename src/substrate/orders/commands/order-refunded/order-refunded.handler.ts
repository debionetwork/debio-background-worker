import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderRefundedCommand } from './order-refunded.command';

@Injectable()
@CommandHandler(OrderRefundedCommand)
export class OrderRefundedHandler
  implements ICommandHandler<OrderRefundedCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: OrderRefundedCommand) {
    const { orders: order } = command;
    
    return this.elasticsearchService.update({
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
          created_at: order.createdAt.toString(),
          updated_at: order.updatedAt.toString(),
          order_flow: order.orderFlow,
          blockMetaData: command.blockMetaData,
        },
      },
    }).catch((error) => {
      throw(error)
    });
  }
}