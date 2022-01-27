export class ClaimRequestModel {
  constructor(args: Array<unknown>) {
    this.lab_address = args[0].toString();
    this.request_hash = args[1].toString();
  }
  request_hash: string;
  lab_address: string;
}
