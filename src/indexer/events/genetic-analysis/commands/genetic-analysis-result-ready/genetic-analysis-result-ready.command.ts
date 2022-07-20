import { GeneticAnalysisModel } from '../../../../models/genetic-analysis/genetic-analysis.model';
import { BlockMetaData } from '../../../../models/block-meta-data';

export class GeneticAnalysisResultReadyCommandIndexer {
  public geneticAnalysisModel: GeneticAnalysisModel;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.geneticAnalysisModel = new GeneticAnalysisModel(data[0].toHuman());
  }
}
