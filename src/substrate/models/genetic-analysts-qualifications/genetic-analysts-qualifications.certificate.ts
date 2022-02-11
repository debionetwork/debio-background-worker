export class GeneticAnalystsQualificationsCertification {
  constructor(certification: any) {
    this.title = certification.title;
    this.issuer = certification.issuer;
    this.month = certification.month;
    this.year = certification.year;
    this.description = certification.description;
    this.supporting_document = certification.supportingDocument;
  }

  public title: string;
  public issuer: string;
  public month: string;
  public year: string;
  public description: string;
  public supporting_document?: string;
}
