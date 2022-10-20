import { CurrencyType } from '../currency-type';
import { MenstrualSubscriptionDuration } from './menstrual-subscription-duration';

export class MenstrualSubscriptionPrice {
  constructor(anyJson: any) {
    this.duration = anyJson.duration;
    this.currency = anyJson.currency;
    this.assetId = anyJson.assetId;
    this.amount = anyJson.amount;
  }

  duration: MenstrualSubscriptionDuration;
  currency: CurrencyType;
  assetId: number;
  amount: BigInt;
}
