import { BlockMetaData } from "src/substrate/models/blockMetaData";
import { Orders } from "../../models/orders";

export class OrderRefundedCommand {
  constructor(public readonly orders: Orders, public readonly blockMetaData: BlockMetaData) {}
}
