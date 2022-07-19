import { GCloudSecretManagerModule } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Module } from '@nestjs/common';
import { DebioConversionService } from './debio-conversion.service';

@Module({
  imports: [GCloudSecretManagerModule.withConfig(process.env.PARENT)],
  providers: [DebioConversionService],
  exports: [DebioConversionService],
})
export class DebioConversionModule {}
