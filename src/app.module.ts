import { Module } from '@nestjs/common';
import { SubstrateModule } from './substrate/substrate.module';

require('dotenv').config();

@Module({
  imports: [SubstrateModule],
})
export class AppModule {}
