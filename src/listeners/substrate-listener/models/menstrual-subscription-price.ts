export class MenstrualSubscriptionPrice {
  constructor(type: any) {
    this.duration = type?.duration;
    this.currency = type?.currency;
    this.assetId = type?.assetId;
    this.amount = Number(
      String(type?.amount ?? '')
        .split(',')
        .join(''),
    );
  }
  duration: string;
  currency: string;
  assetId: number;
  amount: number;
}
