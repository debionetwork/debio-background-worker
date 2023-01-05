import { RequestorInfo } from './info';

export class OpinionRequestor {
  constructor(data: any) {
    this.id = data.id;
    this.account_id = data.account_id;
    this.info = new RequestorInfo(data.info);
    this.created_at = data.created_at
      ? new Date(Number(String(data.created_at).split(',').join('')))
      : null;
    this.updated_at = data.updated_at
      ? new Date(Number(String(data.updated_at).split(',').join('')))
      : null;
  }

  id: string;
  account_id: string;
  info: RequestorInfo;
  created_at: Date;
  updated_at: Date;
}
