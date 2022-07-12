import { GCloudSecretManagerModule } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Module } from '@nestjs/common';
import { ProcessEnvModule } from '../proxies/process-env/process-env.module';
import { SubstrateService } from './substrate.service';

@Module({
  providers: [SubstrateService],
  exports: [SubstrateService],
})
export class SubstrateModule {}

export * from './substrate.service';
