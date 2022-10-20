import { BlockMetaData } from '../../../../models/block-meta-data';
import { MenstrualSubscriptionPrice } from '../../../../models/menstrual-subscription/menstrual-subscription-price';

export class MenstrualSubscriptionPriceAddedCommandIndexer {
  menstrualSubscriptionPrice: MenstrualSubscriptionPrice;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.menstrualSubscriptionPrice = new MenstrualSubscriptionPrice(
      data[0].toHuman(),
    );
  }
}
