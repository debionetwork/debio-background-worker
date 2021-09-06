import { Module } from '@nestjs/common';
import { SubstrateModule } from './substrate/substrate.module';
import { RequestServiceModule } from './ethereum/ethereum.module';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Module({
  imports: [SubstrateModule, RequestServiceModule],
})
export class AppModule {}
