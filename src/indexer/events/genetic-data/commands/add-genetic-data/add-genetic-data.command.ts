import { GeneticDataModel } from '../../../../models/genetic-data/genetic-data.model';
import { BlockMetaData } from '../../../../models/block-meta-data';

export class AddGeneticDataCommand {
  public geneticData: GeneticDataModel;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.geneticData = new GeneticDataModel(data[0].toHuman());
  }
}
