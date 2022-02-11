import { GeneticAnalystsServicesModel } from '../../../../models/genetic-analysts-services/genetic-analysts-services.model';
import { BlockMetaData } from '../../../../models/blockMetaData';

export class GeneticAnalystServicesDeletedCommand {
  public geneticAnalystsServicesModel: GeneticAnalystsServicesModel;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.geneticAnalystsServicesModel = new GeneticAnalystsServicesModel(
      data[0].toHuman(),
    );
  }
}
