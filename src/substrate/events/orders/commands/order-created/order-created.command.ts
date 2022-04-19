import { BlockMetaData } from '../../../../models/blockMetaData';
import { Orders } from '../../../../models/order/orders';

export class OrderCreatedCommand {
  orders: Orders;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const orderData = data[0];
    this.orders = new Orders(orderData.toHuman());
  }
}
