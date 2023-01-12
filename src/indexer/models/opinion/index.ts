import { OpinionInfo } from './info';

export class Opinion {
  constructor(data: any) {
    this.id = data.id;
    this.requestor_id = data.requestorId;
    this.professional_id = data.professionalId;
    this.info = new OpinionInfo(data.info);
    this.status = data.status;
    this.created_at = data.createdAt
      ? Number(String(data.createdAt).split(',').join(''))
      : null;
  }

  id: string;
  requestor_id: string;
  professional_id: string;
  info: OpinionInfo;
  status: string;
  created_at: number;
}
