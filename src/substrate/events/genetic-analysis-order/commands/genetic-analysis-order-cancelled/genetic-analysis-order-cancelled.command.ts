import { GeneticAnalysisOrderModel } from '../../../../models/genetic-analysis-order/genetic-analysis-order.model';
import { BlockMetaData } from '../../../../models/blockMetaData';

export class GeneticAnalysisOrderCancelledCommand {
  public geneticAnalysisOrderModel: GeneticAnalysisOrderModel;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.geneticAnalysisOrderModel = new GeneticAnalysisOrderModel(
      data[0].toHuman(),
    );
  }
}
