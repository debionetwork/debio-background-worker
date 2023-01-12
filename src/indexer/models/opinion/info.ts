import { CurrencyType } from '../currency-type';

export class OpinionInfo {
  constructor(data: any) {
    this.description = data.description;
    this.myriad_url = data.myriadUrl;
    this.asset_id = data.assetId;
    this.currency = data.currency;
    this.amount = data.amount;
  }

  description: string;
  myriad_url: string;
  asset_id: number;
  currency: CurrencyType;
  amount: string;
}
