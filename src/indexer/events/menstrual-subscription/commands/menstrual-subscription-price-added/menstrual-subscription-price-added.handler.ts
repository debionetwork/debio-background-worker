import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { MenstrualSubscriptionPriceAddedCommandIndexer } from './menstrual-subscription-price-added.command';

@Injectable()
@CommandHandler(MenstrualSubscriptionPriceAddedCommandIndexer)
export class MenstrualSubscriptionPriceAddedHandler
  implements ICommandHandler<MenstrualSubscriptionPriceAddedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: MenstrualSubscriptionPriceAddedCommandIndexer) {
    const { menstrualSubscriptionPrice, blockMetaData } = command;

    const { duration, currency, assetId, amount } = menstrualSubscriptionPrice;
    await this.elasticsearchService.create({
      index: 'menstrual-subscription-price',
      id: `${duration}-${currency}-${assetId}-${amount}`,
      refresh: 'wait_for',
      body: {
        duration: duration,
        currency: currency,
        asset_id: assetId,
        amount: amount,
        blockMetaData: blockMetaData,
      },
    });
  }
}
