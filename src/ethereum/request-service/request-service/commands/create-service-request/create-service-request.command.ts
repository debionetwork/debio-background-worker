import { RequestModel } from "../../models/request";

export class CreateServiceRequestCommand {
  request: RequestModel;
  constructor(args: Array<Object>) {
    this.request = new RequestModel(args);
  }
}
  