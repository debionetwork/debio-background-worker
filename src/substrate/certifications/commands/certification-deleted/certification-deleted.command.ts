import { BlockMetaData } from "src/substrate/models/blockMetaData";
import { Certification } from "../../models/certification";

export class CertificationDeletedCommand {
  certification: Certification;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const certificationData = data[0];
    this.certification = new Certification(certificationData.toHuman());
  }
}