import { ApiPromise } from '@polkadot/api';
import 'regenerator-runtime/runtime';
import {
  deregisterLab,
  stakeLab,
} from '@debionetwork/polkadot-provider/lib/command/labs';
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
import { LocationEntities } from '../../../../../../src/common/location/models';
import { dummyCredentials } from '../../../../config';
import { EscrowService } from '../../../../../../src/common/escrow/escrow.service';
import { escrowServiceMockFactory } from '../../../../../unit/mock';
import {
  DateTimeModule,
  DebioConversionModule,
  MailModule,
  NotificationModule,
  ProcessEnvModule,
  SubstrateModule,
  TransactionLoggingModule,
} from '../../../../../../src/common';
import { LocationModule } from '../../../../../../src/common/location/location.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SubstrateListenerHandler } from '../../../../../../src/listeners/substrate-listener/substrate-listener.handler';
import { LabStakeSuccessfullHandler } from '../../../../../../src/listeners/substrate-listener/commands/labs/stake-successfull/stake-successful.handler';
import { createConnection } from 'typeorm';
import { GCloudSecretManagerModule } from '@debionetwork/nestjs-gcloud-secret-manager';

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

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
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
    }).compile();

    app = module.createNestApplication();
    await app.init();

    const { api: _api, pair: _pair } = await initializeApi();
    api = _api;
    pair = _pair;
  }, 360000);

  afterAll(async () => {
    await api.disconnect();
    await app.close();
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

    const dbConnection = await createConnection({
      ...dummyCredentials,
      database: 'db_postgres',
      entities: [TransactionRequest],
      synchronize: true,
    });

    const labLogging = await dbConnection
      .getRepository(TransactionRequest)
      .createQueryBuilder('transaction_logs')
      .where('transaction_logs.transaction_type = :transaction_type', {
        transaction_type: 6,
      })
      .where('transaction_logs.transaction_status = :transaction_status', {
        transaction_status: 26,
      })
      .getMany();

    expect(labLogging[0].ref_number).toEqual(lab.accountId);
    expect(labLogging[0].transaction_type).toEqual(6);
    expect(labLogging[0].transaction_status).toEqual(26);

    await deregisterLab(api, pair);
  }, 180000);
});
