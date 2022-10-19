import { RequestStatus } from "./request-status";

export class UpdateServiceRequest {
  constructor(requestId: string, status: RequestStatus) {
    this.requestId = requestId;
    this.status = status;
  }

  requestId: string;
  status: RequestStatus;
}