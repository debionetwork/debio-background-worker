import { Module } from '@nestjs/common';
import { EthersModule } from 'nestjs-ethers';
import { CommonModule } from 'src/common/common.module';
import { RequestServiceCommandHandlers } from './request-service';
import { BlockCommandHandlers, BlockQueryHandlers } from './blocks';
import { RequestServiceController, RequestServiceService } from './request-service.handler';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Module({
  imports: [
    EthersModule.forRoot({
      network: process.env.WEB3_RPC,
      useDefaultProvider: true,
    }),
    CommonModule,
  ],
  controllers: [RequestServiceController],
  providers: [
    RequestServiceService,
    ...BlockCommandHandlers,
    ...BlockQueryHandlers,
    ...RequestServiceCommandHandlers
  ],
})
export class RequestServiceModule {}
