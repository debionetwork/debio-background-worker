export class RequestorInfo {
  constructor(data: any) {
    this.category = data.category;
    this.description = data.description;
    this.genetic_data_ids = data.geneticDataIds;
    this.opinion_ids = data.opinionIds;
    this.myriad_url = data.myriadUrl;
  }

  category: string;
  description: string;
  genetic_data_ids: string[];
  opinion_ids: string[];
  myriad_url: string;
}
