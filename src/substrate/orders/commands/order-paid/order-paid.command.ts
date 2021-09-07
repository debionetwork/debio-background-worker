import { Orders } from "../../models/orders";

export class OrderPaidCommand {
  constructor(public readonly orders: Orders) {}
}
