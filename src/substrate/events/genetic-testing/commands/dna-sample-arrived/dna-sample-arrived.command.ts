import { BlockMetaData } from "../../../models/blockMetaData";

export class DNASampleArrivedCommand {
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetaData) {
    
  }
}