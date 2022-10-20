import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { MenstrualSubscriptionAddedCommandIndexer } from './menstrual-subscription-added.command';

@Injectable()
@CommandHandler(MenstrualSubscriptionAddedCommandIndexer)
export class MenstrualSubscriptionAddedHandler
  implements ICommandHandler<MenstrualSubscriptionAddedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: MenstrualSubscriptionAddedCommandIndexer) {
    const { menstrualSubscription, blockMetaData } = command;

    await this.elasticsearchService.create({
      index: 'menstrual-subscription',
      id: menstrualSubscription.id,
      refresh: 'wait_for',
      body: {
        id: menstrualSubscription.id,
        address_id: menstrualSubscription.addressId,
        duration: menstrualSubscription.duration,
        currency: menstrualSubscription.currency,
        payment_status: menstrualSubscription.paymentStatus,
        status: menstrualSubscription.status,
        created_at: menstrualSubscription.createdAt.getTime(),
        updated_at: menstrualSubscription.updatedAt.getTime(),
        blockMetaData: blockMetaData,
      },
    });
  }
}
