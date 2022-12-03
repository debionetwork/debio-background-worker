import { Transform } from 'class-transformer';

export class TransactionLoggingDto {
  address: string;

  amount: number;

  created_at: Date;

  currency: string;

  @Transform((val) => BigInt(val.value))
  parent_id: bigint;

  ref_number: string;

  transaction_status: number;

  transaction_type: number;

  transaction_hash?: string;
}
