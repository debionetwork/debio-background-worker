import { BlockMetaData } from 'src/substrate/models/blockMetaData';
import { Lab } from '../../models/lab';

export class LabDeregisteredCommand {
  labs: Lab;
  constructor(data: Array<Lab>, public readonly blockMetaData: BlockMetaData) {
    this.labs = data[0];
  }
}
