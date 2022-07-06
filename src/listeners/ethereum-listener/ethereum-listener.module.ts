import { Module } from '@nestjs/common';
import { EthereumModule } from '../../common/ethereum';
import { EscrowModule } from '../../common/escrow/escrow.module';
import { EthereumListenerHandler } from './ethereum-listener.handler';
import { TransactionLoggingModule } from '../../common';

@Module({
  imports: [EthereumModule, EscrowModule, TransactionLoggingModule],
  providers: [EthereumListenerHandler],
})
export class EthereumListenerModule {}
