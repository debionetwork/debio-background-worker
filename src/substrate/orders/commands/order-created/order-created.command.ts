import { BlockMetaData } from "src/substrate/models/blockMetaData";
import { Orders } from "../../models/orders";

export class OrderCreatedCommand {
  constructor(public readonly orders: Orders, public readonly blockMetaData: BlockMetaData) {}
}
