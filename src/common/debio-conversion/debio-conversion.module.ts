import { GCloudSecretManagerModule } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Module } from '@nestjs/common';
import { DebioConversionService } from './debio-conversion.service';
import { SecretKeyList } from '../../secrets';

@Module({
  imports: [
    GCloudSecretManagerModule.withConfig(process.env.PARENT, SecretKeyList),
  ],
  providers: [DebioConversionService],
  exports: [DebioConversionService],
})
export class DebioConversionModule {}
