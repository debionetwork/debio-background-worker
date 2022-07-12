import { BlockMetaData } from '../../../../models/block-meta-data';
import { Lab } from '../../../../models/lab/lab';

export class LabDeregisteredCommand {
  labs: Lab;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const labData = data[0];
    this.labs = new Lab(labData.toHuman());
  }
}
