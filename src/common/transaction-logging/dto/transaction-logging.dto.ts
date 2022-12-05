import { TransactionStatusList } from '@common/transaction-status/models/transaction-status.list';
import { TransactionTypeList } from '@common/transaction-type/models/transaction-type.list';
import { Transform } from 'class-transformer';

export class TransactionLoggingDto {
  address: string;

  amount: number;

  created_at: Date;

  currency: string;

  @Transform((val) => BigInt(val.value))
  parent_id: bigint;

  ref_number: string;

  transaction_status: TransactionStatusList;

  transaction_type: TransactionTypeList;

  transaction_hash?: string;
}
