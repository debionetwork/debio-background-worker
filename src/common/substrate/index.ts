import { GCloudSecretManagerModule } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Module } from '@nestjs/common';
import { SubstrateService } from './substrate.service';

@Module({
  imports: [GCloudSecretManagerModule.withConfig(process.env.PARENT)],
  providers: [SubstrateService],
  exports: [SubstrateService],
})
export class SubstrateModule {}

export * from './substrate.service';
