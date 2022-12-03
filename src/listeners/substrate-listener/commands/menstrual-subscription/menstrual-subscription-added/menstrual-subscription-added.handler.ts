import { SubstrateService } from '@common/substrate';
import { TransactionLoggingService } from '@common/transaction-logging';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import { MenstrualSubscriptionPrice } from '@listeners/substrate-listener/models/menstrual-subscription-price';
import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MenstrualSubscriptionAddedCommand } from './menstrual-subscription-added.command';

@Injectable()
@CommandHandler(MenstrualSubscriptionAddedCommand)
export class MenstrualSubscriptionAddedHandler
  implements ICommandHandler<MenstrualSubscriptionAddedCommand>
{
  private readonly logger: Logger = new Logger(
    MenstrualSubscriptionAddedHandler.name,
  );

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly substrateService: SubstrateService,
  ) {}

  async execute(command: MenstrualSubscriptionAddedCommand) {
    const { menstrualSubscription, blockMetaData } = command;

    this.logger.log(
      `Menstrual Subscription Added With Hash: ${menstrualSubscription.id}!`,
    );

    const subscriptionPrice = (
      await this.substrateService.api.query.menstrualSubscription.menstrualSubscriptionPrices(
        menstrualSubscription.duration,
        menstrualSubscription.currency,
      )
    ).toHuman();

    const menstrualSubscriptionPrice = new MenstrualSubscriptionPrice(
      subscriptionPrice,
    );

    const menstrualSubscriptionLogging: TransactionLoggingDto = {
      address: menstrualSubscription.addressId,
      amount: menstrualSubscriptionPrice.amount,
      created_at: menstrualSubscription.createdAt,
      currency: menstrualSubscription.currency,
      parent_id: BigInt(0),
      ref_number: menstrualSubscription.id,
      transaction_status: 38,
      transaction_type: 9,
      transaction_hash: blockMetaData.blockHash,
    };

    try {
      const isServiceRequestHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          menstrualSubscription.id,
          38,
        );

      if (!isServiceRequestHasBeenInsert) {
        await this.loggingService.create(menstrualSubscriptionLogging);
      }
    } catch (error) {
      this.logger.log(error);
    }
  }
}
