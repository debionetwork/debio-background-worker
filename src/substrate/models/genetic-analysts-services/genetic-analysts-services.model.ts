import { GeneticAnalystsServicesInfo } from './genetic-analysts-services.info';

export class GeneticAnalystsServicesModel {
  constructor(geneticAnalystsServices: any) {
    this.id = geneticAnalystsServices.id;
    this.owner_id = geneticAnalystsServices.ownerId;
    this.info = new GeneticAnalystsServicesInfo(geneticAnalystsServices.info);
  }

  public id: string;
  public owner_id: string;
  public info: GeneticAnalystsServicesInfo;
}
