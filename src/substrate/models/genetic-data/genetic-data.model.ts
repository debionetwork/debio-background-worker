export class GeneticDataModel {
  constructor(geneticData: any) {
    this.id = geneticData.id;
    this.ownerId = geneticData.ownerId;
    this.title = geneticData.title;
    this.description = geneticData.description;
    this.reportLink = geneticData.reportLink;
  }

  public id: string;
  public ownerId: string;
  public title: string;
  public description: string;
  public reportLink: string;
}
