import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { IndexerModule } from './indexer/indexer.module';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Module({
  imports: [ScheduleModule.forRoot(), IndexerModule],
})
export class AppModule {}
