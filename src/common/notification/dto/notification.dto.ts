export class NotificationDto {
  role: string;
  entity_type: string;
  entity: string;
  reference_id?: string;
  description: string;
  read: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  from: string;
  to: string;
  block_number: string;
}
