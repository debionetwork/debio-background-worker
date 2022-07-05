import { GeneticAnalysisModel } from '../../../../models/genetic-analysis/genetic-analysis.model';
import { BlockMetaData } from '../../../../models/blockMetaData';

export class GeneticAnalysisResultReadyCommand {
  public geneticAnalysisModel: GeneticAnalysisModel;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.geneticAnalysisModel = new GeneticAnalysisModel(data[0].toHuman());
  }
}
