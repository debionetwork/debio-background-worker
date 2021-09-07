import { Orders } from "../../models/orders";

export class OrderFailedCommand {
  constructor(public readonly orders: Orders) {}
}
