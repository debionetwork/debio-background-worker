import { RequestStatus } from './request-status';

export class UpdateServiceRequest {
  constructor(hash: string, status: RequestStatus) {
    this.hash = hash;
    this.status = status;
  }

  hash: string;
  status: RequestStatus;
}
