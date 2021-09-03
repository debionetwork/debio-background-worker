import { Orders } from "../../models/orders";

export class OrderCreatedCommand {
  constructor(public readonly orders: Orders) {}
}
