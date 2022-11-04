import { hexToUtf8, isHex } from '../util';
import { RequestStatus } from './request-status';

export class RequestModel {
  constructor(request: any) {
    this.hash = request.hash_;
    this.requester_address = request.requesterAddress;
    this.lab_address = request.labAddress;
    this.country = request.country;
    this.service_id = request.serviceId;
    this.order_id = request.orderId;

    const city = request.city;
    this.city = isHex(city) ? hexToUtf8(city) : city;
    this.region = request.region;

    this.region = request.region;

    this.service_category = request.serviceCategory;
    this.staking_amount = request.stakingAmount;
    this.status = request.status;
    this.created_at = request.createdAt;
    this.updated_at = request.updatedAt;
    this.unstaked_at = request.unstakedAt;
  }

  hash: string;
  requester_address: string;
  lab_address: string;
  service_id: string;
  order_id: string;
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
