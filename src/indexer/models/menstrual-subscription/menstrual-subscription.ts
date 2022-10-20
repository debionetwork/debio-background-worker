import { CurrencyType } from '../currency-type';
import { MenstrualSubscriptionDuration } from './menstrual-subscription-duration';
import { MenstrualSubscriptionStatus } from './menstrual-subscription-status';
import { PaymentStatus } from './payment-status';

export class MenstrualSubscription {
  constructor(anyJson: any) {
    this.id = anyJson.id;
    this.addressId = anyJson.addressId;
    this.duration = anyJson.duration;
    this.currency = anyJson.currency;
    this.paymentStatus = anyJson.paymentStatus;
    this.status = anyJson.status;

    this.createdAt = new Date(
      Number(String(anyJson.createdAt).split(',').join('')),
    );
    this.updatedAt = new Date(
      Number(String(anyJson.updatedAt).split(',').join('')),
    );
  }

  id: string;
  addressId: string;
  duration: MenstrualSubscriptionDuration;
  currency: CurrencyType;
  paymentStatus: PaymentStatus;
  status: MenstrualSubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}
