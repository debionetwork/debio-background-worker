import { BlockMetaData } from '../../../../models/blockMetaData';
import { Lab } from '../../models/lab';

export class LabUpdatedCommand {
  labs: Lab;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const labData = data[0];
    this.labs = new Lab(labData.toHuman());
  }
}
