import { GeneticAnalystsQualificationModel } from '../../../../models/genetic-analysts-qualifications/genetic-analysts-qualifications.model';
import { BlockMetaData } from '../../../../models/block-meta-data';

export class GeneticAnalystsQualificationUpdatedCommandIndexer {
  public geneticAnalystsQualificationModel: GeneticAnalystsQualificationModel;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.geneticAnalystsQualificationModel =
      new GeneticAnalystsQualificationModel(data[0].toHuman());
  }
}
