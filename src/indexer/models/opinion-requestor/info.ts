export class RequestorInfo {
  constructor(data: any) {
    this.category = data.category;
    this.description = data.description;
    this.genetic_data_ids = data.genetic_data_ids;
    this.opinion_ids = data.opinion_ids;
    this.myriad_url = data.myriad_url;
  }

  category: string;
  description: string;
  genetic_data_ids: string[];
  opinion_ids: string[];
  myriad_url: string;
}
