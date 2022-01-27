import { BlockMetaData } from 'src/substrate/models/blockMetaData';
import { Orders } from '../../models/orders';

export class OrderRefundedCommand {
  orders: Orders;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const orderData = data[0];
    this.orders = new Orders(orderData.toHuman());
  }
}
