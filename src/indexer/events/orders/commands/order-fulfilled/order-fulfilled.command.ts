import { BlockMetaData } from '../../../../models/block-meta-data';
import { Orders } from '../../../../models/order/orders';

export class OrderFulfilledCommand {
  orders: Orders;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const orderData = data[0];
    this.orders = new Orders(orderData.toHuman());
  }
}
