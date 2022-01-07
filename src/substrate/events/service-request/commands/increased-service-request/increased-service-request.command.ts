import { BlockMetaData } from "../../../../models/blockMetaData";

export class IncreasedServiceRequestCommand {
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetaData) {

  }
}