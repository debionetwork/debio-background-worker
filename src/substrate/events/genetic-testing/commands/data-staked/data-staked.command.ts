import { BlockMetaData } from "../../../../models/blockMetaData";
import { DataStaked } from "../../models/data-staked";

export class DataStakedCommand {
  dataStaked: DataStaked;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.dataStaked = new DataStaked(data[0], data[1], data[2]);
  }
}