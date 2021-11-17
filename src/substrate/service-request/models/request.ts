import { RequestStatus } from "./requestStatus";

export class RequestModel {
  constructor(
    _hash: any,
    _requesterAddress: any,
    _labAddress: any,
    _country: any,
    _region: any,
    _city: any,
    _serviceCategory: any,
    _stakingAmount: any,
    _status: any,
    _created_at: any,
    _updated_at: any,
    _unstakedAt: any
  ) {
    const decoder = new TextDecoder();

    this.hash               = _hash;
    this.requester_address  = _requesterAddress;
    this.lab_address        = _labAddress;
    this.country            = decoder.decode(_country);
    this.region             = decoder.decode(_region);
    this.city               = decoder.decode(_city);
    this.service_category   = decoder.decode(_serviceCategory);
    this.staking_amount     = _stakingAmount.toString();
    this.status             = _status;
    this.created_at         = _created_at.toString();
    this.updated_at         = _updated_at.toString();
    this.unstaked_at        = _unstakedAt.toString();
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
