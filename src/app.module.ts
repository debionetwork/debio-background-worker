import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SubstrateModule } from './substrate/substrate.module';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Module({
  imports: [ScheduleModule.forRoot(), SubstrateModule],
})
export class AppModule {}
