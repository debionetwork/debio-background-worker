import { OpinionInfo } from './info';

export class Opinion {
  constructor(data: any) {
    this.id = data.id;
    this.requestor_id = data.requestor_id;
    this.professional_id = data.professional_id;
    this.info = new OpinionInfo(data.info);
    this.status = data.status;
    this.created_at = data.created_at;
  }

  id: string;
  requestor_id: string;
  professional_id: string;
  info: OpinionInfo;
  status: string;
  created_at: Date;
}
