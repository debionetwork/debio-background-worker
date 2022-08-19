import { GeneticAnalystsModel } from '../../../../models/genetic-analysts/genetic-analysts.model';
import { BlockMetaData } from '../../../../models/block-meta-data';

export class GeneticAnalystsRetrieveUnstakeAmountCommandIndexer {
  public geneticAnalystsModel: GeneticAnalystsModel;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.geneticAnalystsModel = new GeneticAnalystsModel(data[0].toHuman());
  }
}
