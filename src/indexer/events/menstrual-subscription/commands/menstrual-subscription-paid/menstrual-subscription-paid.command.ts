import { MenstrualSubscription } from '../../../../models/menstrual-subscription/menstrual-subscription';
import { BlockMetaData } from '../../../../models/block-meta-data';

export class MenstrualSubscriptionPaidCommandIndexer {
  menstrualSubscription: MenstrualSubscription;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.menstrualSubscription = new MenstrualSubscription(data[0].toHuman());
  }
}
