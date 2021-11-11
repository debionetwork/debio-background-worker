import { BlockMetaData } from "src/substrate/models/blockMetaData";
import { Orders } from "../../models/orders";

export class OrderPaidCommand {
  orders: Orders;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.orders = new Orders(
      data[0]["id"],
      data[0]["serviceId"],
      data[0]["customerId"],
      data[0]["customerBoxPublicKey"],
      data[0]["sellerId"],
      data[0]["dnaSampleTrackingId"],
      data[0]["currency"],
      data[0]["prices"],
      data[0]["additionalPrices"],
      data[0]["orderFlow"],
      data[0]["status"],
      data[0]["createdAt"],
      data[0]["updatedAt"]
    );
  }
}
