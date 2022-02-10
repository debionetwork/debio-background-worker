export class GeneticDataModel {
  constructor(geneticData: any) {
    this.id = geneticData.id;
    this.owner_id = geneticData.ownerId;
    this.title = geneticData.title;
    this.description = geneticData.description;
    this.report_link = geneticData.reportLink;
  }

  public id: string;
  public owner_id: string;
  public title: string;
  public description: string;
  public report_link: string;
}
