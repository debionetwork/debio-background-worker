import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowAccounts } from './models/deposit.entity';
import { EscrowService } from './escrow.service';
import { EthereumModule, SubstrateModule } from '../index';
import { ErrorLoggingModule } from '../error-logging';

require('dotenv').config(); // eslint-disable-line
@Module({
  imports: [
    TypeOrmModule.forFeature([EscrowAccounts]),
    SubstrateModule,
    ErrorLoggingModule,
    forwardRef(() => EthereumModule),
  ],
  providers: [EscrowService],
  exports: [TypeOrmModule, EscrowService],
})
export class EscrowModule {}
