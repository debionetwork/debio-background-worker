import { Orders } from "../../models/orders";

export class OrderFulfilledCommand {
  constructor(public readonly orders: Orders) {}
}
