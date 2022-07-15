import { deregisterLab, queryLabCount } from '@debionetwork/polkadot-provider';
import { INestApplication } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiPromise } from '@polkadot/api';
import { CommonModule } from '../../../../../src/common/common.module';
import { ProcessEnvModule } from '../../../../../src/common/proxies/process-env/process-env.module';
import { IndexerHandler } from '../../../../../src/indexer/indexer.handler';
import { initializeApi } from '../../../polkadot-init';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { IndexerModule } from '../../../../../src/indexer/indexer.module';
import { LabDeregisteredHandler } from '../../../../../src/indexer/events/labs/commands/lab-deregistered/lab-deregistered.handler';

describe('Event Command Service Request Claimed', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
  let elasticsearchService: ElasticsearchService;

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
      ['EMAIL', process.env.EMAIL],
      ['PASS_EMAIL', process.env.PASS_EMAIL],
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
        CommonModule,
        ProcessEnvModule,
        CqrsModule,
        ScheduleModule.forRoot(),
        IndexerModule,
      ],
      providers: [IndexerHandler, LabDeregisteredHandler],
    })
      .overrideProvider(GCloudSecretManagerService)
      .useClass(GoogleSecretManagerServiceMock)
      .compile();

    elasticsearchService =
      module.get<ElasticsearchService>(ElasticsearchService);
    app = module.createNestApplication();
    await app.init();

    const { api: _api, pair: _pair } = await initializeApi();
    api = _api;
    pair = _pair;
  }, 450000);

  afterAll(async () => {
    await api.disconnect();
    await elasticsearchService.close();
    await app.close();
  }, 12000);

  it('lab updated', async () => {
    await deregisterLab(api, pair);

    const labCount = await queryLabCount(api);
    expect(labCount).toEqual(0);

    const labList = await elasticsearchService.count({
      index: 'labs',
      body: {
        query: {
          match: {
            _id: {
              query: pair.address,
            },
          },
        },
      },
    });

    expect(labList.body.count).toEqual(0);
  }, 80000);
});
