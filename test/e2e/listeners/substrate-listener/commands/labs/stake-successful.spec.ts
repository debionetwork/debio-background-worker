import { ApiPromise } from '@polkadot/api';
import 'regenerator-runtime/runtime';
import { stakeLab } from '@debionetwork/polkadot-provider/lib/command/labs';
import { queryLabById } from '@debionetwork/polkadot-provider/lib/query/labs';
import { Lab } from '@debionetwork/polkadot-provider/lib/models/labs';
import { registerLab } from '@debionetwork/polkadot-provider/lib/command/labs';
import { labDataMock } from '../../../../../mock/models/labs/labs.mock';
import { TestingModule } from '@nestjs/testing/testing-module';
import { Test } from '@nestjs/testing/test';
import { INestApplication } from '@nestjs/common/interfaces/nest-application.interface';
import { initializeApi } from '../../../../polkadot-init';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { LabRating } from '../../../../../mock/models/rating/rating.entity';
import { TransactionRequest } from '../../../../../../src/common/transaction-logging/models/transaction-request.entity';
import { dummyCredentials } from '../../../../config';
import { EscrowService } from '../../../../../../src/common/escrow/escrow.service';
import { escrowServiceMockFactory } from '../../../../../unit/mock';
import {
  DateTimeModule,
  ProcessEnvModule,
  SubstrateModule,
  TransactionLoggingModule,
} from '../../../../../../src/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SubstrateListenerHandler } from '../../../../../../src/listeners/substrate-listener/substrate-listener.handler';
import { LabStakeSuccessfullHandler } from '../../../../../../src/listeners/substrate-listener/commands/labs/stake-successfull/stake-successful.handler';
import { createConnection } from 'typeorm';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { StakeStatus } from '@debionetwork/polkadot-provider/lib/primitives/stake-status';

describe('lab staking Integration Tests', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
  let lab: Lab;

  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['ELASTICSEARCH_NODE', process.env.ELASTICSEARCH_NODE],
      ['ELASTICSEARCH_USERNAME', process.env.ELASTICSEARCH_USERNAME],
      ['ELASTICSEARCH_PASSWORD', process.env.ELASTICSEARCH_PASSWORD],
      ['SUBSTRATE_URL', process.env.SUBSTRATE_URL],
      ['ADMIN_SUBSTRATE_MNEMONIC', process.env.ADMIN_SUBSTRATE_MNEMONIC],
    ]);
    loadSecrets() {
      return null;
    }

    getSecret(key) {
      return this._secretsList.get(key);
    }
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        GCloudSecretManagerModule.withConfig(process.env.GCS_PARENT),
        TypeOrmModule.forRoot({
          type: 'postgres',
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [LabRating, TransactionRequest],
          autoLoadEntities: true,
        }),
        ProcessEnvModule,
        TransactionLoggingModule,
        SubstrateModule,
        CqrsModule,
        DateTimeModule,
      ],
      providers: [
        {
          provide: EscrowService,
          useFactory: escrowServiceMockFactory,
        },
        SubstrateListenerHandler,
        LabStakeSuccessfullHandler,
      ],
    })
      .overrideProvider(GCloudSecretManagerService)
      .useClass(GoogleSecretManagerServiceMock)
      .compile();

    app = module.createNestApplication();
    await app.init();

    const { api: _api, pair: _pair } = await initializeApi();
    api = _api;
    pair = _pair;
  }, 360000);

  afterAll(async () => {
    app.flushLogs();
    await api.disconnect();
    await app.close();
    app = null;
    api = null;
    lab = null;
  });

  it('lab staking event', async () => {
    // eslint-disable-next-line
    const labRegisterPromise: Promise<Lab> = new Promise((resolve, reject) => {
      registerLab(api, pair, labDataMock.info, () => {
        queryLabById(api, pair.address).then((res) => {
          resolve(res);
        });
      });
    });

    lab = await labRegisterPromise;
    expect(lab.info).toEqual(labDataMock.info);

    // eslint-disable-next-line
    const labStakingPromise: Promise<Lab> = new Promise((resolve, reject) => {
      stakeLab(api, pair, () => {
        queryLabById(api, pair.address).then((res) => {
          resolve(res);
        });
      });
    });

    lab = await labStakingPromise;
    expect(lab.accountId).toEqual(pair.address);
    expect(lab.stakeStatus).toEqual(StakeStatus.Staked);

    const dbConnection = await createConnection({
      ...dummyCredentials,
      database: 'db_postgres',
      entities: [TransactionRequest],
      synchronize: true,
    });

    const labLogging = await dbConnection
      .getRepository(TransactionRequest)
      .createQueryBuilder('transaction_logs')
      .where(
        'transaction_logs.transaction_type = :transaction_type AND transaction_logs.transaction_status = :transaction_status',
        {
          transaction_type: 6,
          transaction_status: 26,
        },
      )
      .getMany();

    expect(labLogging.length).toBeGreaterThan(0);
    expect(labLogging[0].ref_number).toEqual(lab.accountId);
    expect(labLogging[0].transaction_type).toEqual(6);
    expect(labLogging[0].transaction_status).toEqual(26);
  }, 180000);
});
