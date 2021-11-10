import { RequestStatus } from "./requestStatus";

export class RequestModel {
  hash: string;
  requesterAddress: string;
  labAddress: string;
  country: string;
  region: string;
  city: string;
  serviceCategory: string;
  stakingAmount: string;
  status: RequestStatus;
  exists: boolean;
}
