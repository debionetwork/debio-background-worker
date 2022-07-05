import { GeneticAnalystsModel } from '../../../../models/genetic-analysts/genetic-analysts.model';
import { BlockMetaData } from '../../../../models/blockMetaData';

export class GeneticAnalystsUpdatedCommand {
  public geneticAnalystsModel: GeneticAnalystsModel;
  constructor(data: Array<any>, public blockMetaData: BlockMetaData) {
    this.geneticAnalystsModel = new GeneticAnalystsModel(data[0].toHuman());
  }
}
