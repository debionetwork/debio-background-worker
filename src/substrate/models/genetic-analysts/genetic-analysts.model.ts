import { GeneticAnalystsInfo } from './genetic-analysts.info';

export class GeneticAnalystsModel {
  constructor(geneticAnalysts: any) {
    this.account_id = geneticAnalysts.accountId;
    this.services = geneticAnalysts.services;
    this.qualifications = geneticAnalysts.qualifications;
    this.info = new GeneticAnalystsInfo(geneticAnalysts.info);
  }

  public account_id: string;
  public services: string[];
  public qualifications: string[];
  public info: GeneticAnalystsInfo;
}
