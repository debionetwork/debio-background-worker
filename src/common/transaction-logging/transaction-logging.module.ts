import { TransactionStatusModule } from '@common/transaction-status/transaction-status.module';
import { TransactionTypeModule } from '@common/transaction-type/transaction-type.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionRequest } from './models/transaction-request.entity';
import { TransactionLoggingService } from './transaction-logging.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionRequest]),
    TransactionStatusModule,
    TransactionTypeModule,
  ],
  exports: [TypeOrmModule, TransactionLoggingService],
  controllers: [],
  providers: [TransactionLoggingService],
})
export class TransactionLoggingModule {}
