import { BlockMetaData } from '../../../../models/block-meta-data';
import { DataStaked } from '../../../../models/genetic-testing/data-staked';

export class DataStakedCommandIndexer {
  dataStaked: DataStaked;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.dataStaked = new DataStaked(data[0], data[1], data[2]);
  }
}
