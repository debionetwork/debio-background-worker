import { GCloudSecretManagerModule } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Module } from '@nestjs/common';
import { SubstrateService } from './substrate.service';
import { SecretKeyList } from '../../secrets';

@Module({
  imports: [
    GCloudSecretManagerModule.withConfig(process.env.PARENT, SecretKeyList),
  ],
  providers: [SubstrateService],
  exports: [SubstrateService],
})
export class SubstrateModule {}

export * from './substrate.service';
