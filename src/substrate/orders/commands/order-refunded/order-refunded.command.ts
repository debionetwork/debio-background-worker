import { Orders } from "../../models/orders";

export class OrderRefundedCommand {
  constructor(public readonly orders: Orders) {}
}
