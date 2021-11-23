import { BlockMetaData } from "src/substrate/models/blockMetaData";
import { Orders } from "../../models/orders";

export class OrderCancelledCommand {
  orders: Orders;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const orderData = data[0];
    this.orders = new Orders(
      orderData["id"],
      orderData["serviceId"],
      orderData["customerId"],
      orderData["customerBoxPublicKey"],
      orderData["sellerId"],
      orderData["dnaSampleTrackingId"],
      orderData["currency"],
      orderData["prices"],
      orderData["additionalPrices"],
      orderData["status"],
      orderData["orderFlow"],
      orderData["createdAt"],
      orderData["updatedAt"]
    );
  }
}
