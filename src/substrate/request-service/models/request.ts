export class RequestModel {
  constructor(args: Array<unknown>) {
    this.requester_address = args[0].toString();
    this.lab_address = args[1].toString();
    this.country = args[2].toString();
    this.city = args[3].toString();
    // this.region = args[4].toString();
    this.service_category = args[4].toString();
    this.staking_amount = args[5].toString();
    this.request_status = args[6].toString();
    this.hash = args[7].toString();
    this.exists = args[8].toString() === 'true';
  }
  requester_address: string;
  lab_address: string;
  country: string;
  city: string;
  region: string;
  service_category: string;
  staking_amount: string;
  request_status: string;
  hash: string;
  exists: boolean;
}
