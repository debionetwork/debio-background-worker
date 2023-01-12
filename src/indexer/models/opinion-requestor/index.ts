import { RequestorInfo } from './info';

export class OpinionRequestor {
  constructor(data: any) {
    this.id = data.id;
    this.account_id = data.accountId;
    this.info = new RequestorInfo(data.info);
    this.created_at = data.createdAt
      ? Number(String(data.createdAt).split(',').join(''))
      : null;
    this.updated_at = data.updatedAt
      ? Number(String(data.updatedAt).split(',').join(''))
      : null;
  }

  id: string;
  account_id: string;
  info: RequestorInfo;
  created_at: number;
  updated_at: number;
}

export * from './info';
