import { BlockMetaData } from 'src/substrate/models/blockMetaData';
import { Lab } from '../../models/lab';

export class LabUpdatedCommand {
  labs: Lab;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const labData = data[0];
    this.labs = new Lab(
      labData["accountId"],
      labData["services"],
      labData["certifications"],
      labData["verificationStatus"],
      labData["info"]
    );
  }
}
