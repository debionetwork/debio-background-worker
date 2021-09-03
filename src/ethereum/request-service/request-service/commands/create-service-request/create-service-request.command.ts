import { RequestModel } from '../../models/request';

export class CreateServiceRequestCommand {
  request: RequestModel;
  constructor(args: Array<unknown>) {
    this.request = new RequestModel(args);
  }
}
