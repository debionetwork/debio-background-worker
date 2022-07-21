import { GeneticAnalystsServicesModel } from '../../../../models/genetic-analysts-services/genetic-analysts-services.model';
import { BlockMetaData } from '../../../../models/block-meta-data';

export class GeneticAnalystServicesDeletedCommandIndexer {
  public geneticAnalystsServicesModel: GeneticAnalystsServicesModel;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.geneticAnalystsServicesModel = new GeneticAnalystsServicesModel(
      data[0].toHuman(),
    );
  }
}
