import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowAccounts } from './models/deposit.entity';
import { EscrowService } from './escrow.service';
import { EthereumModule, SubstrateModule } from '../index';
import { GCloudSecretManagerModule } from '@debionetwork/nestjs-gcloud-secret-manager';
import { SecretKeyList } from '../../common/secrets';

require('dotenv').config(); // eslint-disable-line
@Module({
  imports: [
    TypeOrmModule.forFeature([EscrowAccounts]),
    GCloudSecretManagerModule.withConfig(process.env.PARENT, SecretKeyList),
    SubstrateModule,
    forwardRef(() => EthereumModule),
  ],
  providers: [EscrowService],
  exports: [TypeOrmModule, EscrowService],
})
export class EscrowModule {}
