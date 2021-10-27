import { BlockMetaData } from "src/substrate/models/blockMetaData";
import { DataStaked } from "../../models/data-staked";

export class DataStakedCommand {
    constructor(public readonly dataStaked: DataStaked, public readonly blockMetaData: BlockMetaData) {}
}