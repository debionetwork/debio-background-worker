import { Module } from '@nestjs/common';
import { EthersModule } from 'nestjs-ethers';
import { EthereumService } from './ethereum.service';
import { CachesModule } from '../caches';
import { ProcessEnvModule } from '../proxies';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';

@Module({
  imports: [
    EthersModule.forRootAsync({
      inject: [GCloudSecretManagerService],
      useFactory: async (
        gCloudSecretManagerService: GCloudSecretManagerService,
      ) => {
        return {
          network: gCloudSecretManagerService.getSecret('WEB3_RPC').toString(),
          useDefaultProvider: true,
        };
      },
    }),
    CachesModule,
    ProcessEnvModule,
  ],
  providers: [EthereumService],
  exports: [CachesModule, EthersModule, EthereumService],
})
export class EthereumModule {}
