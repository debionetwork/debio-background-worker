import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { MenstrualSubscriptionPaidCommandIndexer } from './menstrual-subscription-paid.command';

@Injectable()
@CommandHandler(MenstrualSubscriptionPaidCommandIndexer)
export class MenstrualSubscriptionPaidHandler
  implements ICommandHandler<MenstrualSubscriptionPaidCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: MenstrualSubscriptionPaidCommandIndexer) {
    const { menstrualSubscription, blockMetaData } = command;

    await this.elasticsearchService.update({
      index: 'menstrual-subscription',
      id: menstrualSubscription.id,
      refresh: 'wait_for',
      body: {
        doc: {
          payment_status: menstrualSubscription.paymentStatus,
          status: menstrualSubscription.status,
          updated_at: menstrualSubscription.updatedAt.getTime(),
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
