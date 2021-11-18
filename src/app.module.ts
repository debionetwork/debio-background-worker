import { Module } from '@nestjs/common';
import { SubstrateModule } from './substrate/substrate.module';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Module({
  imports: [ SubstrateModule ],
})
export class AppModule {}
