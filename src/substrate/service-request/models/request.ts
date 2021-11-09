import { RequestStatus } from "./requestStatus";

export class RequestModel {
  hash: string;
  requester_address: string;
  lab_address: string;
  country: string;
  region: string;
  city: string;
  service_category: string;
  staking_amount: string;
  status: RequestStatus;
  exists: boolean;
}
