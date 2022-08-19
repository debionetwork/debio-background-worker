import { GeneticAnalysisOrderModel } from '../../../../models/genetic-analysis-order/genetic-analysis-order.model';
import { BlockMetaData } from '../../../../models/block-meta-data';

export class GeneticAnalysisOrderCreatedCommandIndexer {
  public geneticAnalysisOrderModel: GeneticAnalysisOrderModel;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.geneticAnalysisOrderModel = new GeneticAnalysisOrderModel(
      data[0].toHuman(),
    );
  }
}
