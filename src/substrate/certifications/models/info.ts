export class Info {
  constructor(
    info: any
  ) {
    this.title              = info.title;
    this.issuer             = info.issuer;
    this.month              = info.month;
    this.year               = info.year;
    this.description        = info.description;
    this.supporting_document = info.supportingDocument;
  }
  title: string;
  issuer: string;
  month: string;
  year: string;
  description: string;
  supporting_document: string;
}