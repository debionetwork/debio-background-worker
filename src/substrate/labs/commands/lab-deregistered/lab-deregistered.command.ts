import { BlockMetaData } from 'src/substrate/models/blockMetaData';
import { Lab } from '../../models/lab';

export class LabDeregisteredCommand {
  labs: Lab;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.labs = new Lab(
      data[0]["accountId"],
      data[0]["services"],
      data[0]["certifications"],
      data[0]["verificationStatus"],
      data[0]["info"]
    );
  }
}
