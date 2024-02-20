import { Module } from '@nestjs/common';
import { EthersModule } from 'nestjs-ethers';
import { EthereumService } from './ethereum.service';
import { CachesModule } from '../caches';
import { ProcessEnvModule } from '../proxies';
import { config } from '../../config';

@Module({
  imports: [
    EthersModule.forRootAsync({
      imports: [
        ProcessEnvModule.setDefault({
          PARENT: 'PARENT',
          HOST_POSTGRES: 'HOST_POSTGRES',
          DB_POSTGRES: 'debio_escrow_dev',
        }),
      ],
      inject: [],
      useFactory: async (
      ) => {
        return {
          network: config.WEB3_RPC_HTTPS.toString(),
          useDefaultProvider: true,
        };
      },
    }),
    CachesModule,
  ],
  providers: [EthereumService],
  exports: [CachesModule, EthersModule, EthereumService],
})
export class EthereumModule {}
