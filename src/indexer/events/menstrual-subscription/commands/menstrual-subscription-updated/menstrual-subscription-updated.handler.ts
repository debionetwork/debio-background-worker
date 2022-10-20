import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { MenstrualSubscriptionUpdatedCommandIndexer } from './menstrual-subscription-updated.command';

@Injectable()
@CommandHandler(MenstrualSubscriptionUpdatedCommandIndexer)
export class MenstrualSubscriptionUpdatedHandler
  implements ICommandHandler<MenstrualSubscriptionUpdatedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: MenstrualSubscriptionUpdatedCommandIndexer) {
    const { menstrualSubscription, blockMetaData } = command;

    await this.elasticsearchService.update({
      index: 'menstrual-subscription',
      id: menstrualSubscription.id,
      refresh: 'wait_for',
      body: {
        doc: {
          id: menstrualSubscription.id,
          address_id: menstrualSubscription.addressId,
          duration: menstrualSubscription.duration,
          currency: menstrualSubscription.currency,
          payment_status: menstrualSubscription.paymentStatus,
          status: menstrualSubscription.status,
          updated_at: menstrualSubscription.updatedAt.getTime(),
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
