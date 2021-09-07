import { Orders } from "../../models/orders";

export class OrderCancelledCommand {
  constructor(public readonly orders: Orders) {}
}
