import { BlockMetaData } from '../../../../models/blockMetaData';
import { Lab } from '../../../../models/lab/lab';

export class LabRetrieveUnstakeAmountCommand {
  labs: Lab;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const labData = data[0];
    this.labs = new Lab(labData.toHuman());
  }
}
