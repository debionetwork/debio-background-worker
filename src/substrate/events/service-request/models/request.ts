import { RequestStatus } from "./requestStatus";

export class RequestModel {
  constructor(
    request: any
  ) {
    this.hash               = request.hash_;
    this.requester_address  = request.requesterAddress;
    this.lab_address        = request.labAddress;
    this.country            = request.country;
    this.region             = request.region;
    this.city               = request.city;
    this.service_category   = request.serviceCategory;
    this.staking_amount     = request.stakingAmount;
    this.status             = request.status;
    this.created_at         = request.createdAt;
    this.updated_at         = request.updatedAt;
    this.unstaked_at        = request.unstakedAt;
  }

  hash: string;
  requester_address: string;
  lab_address: string;
  country: string;
  region: string;
  city: string;
  service_category: string;
  staking_amount: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  unstaked_at: string;
}
