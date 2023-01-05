import { CurrencyType } from '../currency-type';

export class OpinionInfo {
  constructor(data: any) {
    this.description = data.description;
    this.myriad_url = data.myriad_url;
    this.asset_id = data.asset_id;
    this.currency = data.currency;
    this.amount = data.amount;
  }

  description: string;
  myriad_url: string;
  asset_id: number;
  currency: CurrencyType;
  amount: string;
}
