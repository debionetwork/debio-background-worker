import { GCloudSecretManagerModule } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Module } from '@nestjs/common';
import { ProcessEnvModule } from '../proxies/process-env/process-env.module';
import { SubstrateService } from './substrate.service';

@Module({
  imports: [ProcessEnvModule, GCloudSecretManagerModule],
  providers: [SubstrateService],
  exports: [GCloudSecretManagerModule, SubstrateService],
})
export class SubstrateModule {}

export * from './substrate.service';
