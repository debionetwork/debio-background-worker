import { MenstrualSubscription } from '@indexer/models/menstrual-subscription/menstrual-subscription';
import { BlockMetaData } from '@listeners/substrate-listener/models/block-metadata.event-model';

export class MenstrualSubscriptionPaidCommand {
  menstrualSubscription: MenstrualSubscription;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.menstrualSubscription = new MenstrualSubscription(data[0].toHuman());
  }
}
