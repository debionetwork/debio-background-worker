import { Lab, queryLabById, updateLab } from '@debionetwork/polkadot-provider';
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
import { labDataMock } from '../../../../mock/models/labs/labs.mock';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import { IndexerModule } from '../../../../../src/indexer/indexer.module';
import { LabUpdatedHandler } from '../../../../../src/indexer/events/labs/commands/lab-updated/lab-updated.handler';

describe('Event Command Service Request Claimed', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
  let lab: Lab;
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
      providers: [IndexerHandler, LabUpdatedHandler],
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
    // eslint-disable-next-line
    const updateLabPromise: Promise<Lab> = new Promise((resolve, reject) => {
      updateLab(api, pair, { ...labDataMock.info, name: 'string2' }, () => {
        queryLabById(api, pair.address).then((res) => {
          resolve(res);
        });
      });
    });

    lab = await updateLabPromise;
    expect(lab.info.name).toEqual('string2');

    const labList = await elasticsearchService.search({
      index: 'labs',
      body: {
        query: {
          match: {
            _id: {
              query: lab.accountId,
            },
          },
        },
      },
    });

    expect(labList.body.hits.hits.length).toEqual(1);
    const labSelected = labList.body.hits.hits[0]._source;

    expect(labSelected['info']['name']).toEqual('string2');
    expect(labSelected['info']['email']).toEqual(lab.info.email);
    expect(labSelected['info']['website']).toEqual(lab.info.website);
    expect(labSelected['info']['region']).toEqual(lab.info.region);
    expect(labSelected['info']['address']).toEqual(lab.info.address);
    expect(labSelected['info']['city']).toEqual(lab.info.city);
    expect(labSelected['info']['country']).toEqual(lab.info.country);
  }, 80000);
});
