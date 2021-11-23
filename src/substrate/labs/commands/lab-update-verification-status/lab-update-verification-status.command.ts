import { BlockMetaData } from '../../../models/blockMetaData';
import { Lab } from '../../models/lab';

export class LabUpdateVerificationStatusCommand {
  labs: Lab;
  constructor(data: Array<Lab>, public readonly blockMetaData: BlockMetaData) {
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