import {
  addGeneticData,
  GeneticData,
  queryGeneticDataByOwnerId,
  queryGeneticDataCountByOwner,
  removeGeneticData,
  updateGeneticData,
} from '@debionetwork/polkadot-provider';
import { INestApplication } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiPromise } from '@polkadot/api';
import { CommonModule, ProcessEnvModule } from '@common/index';
import { GeneticDataCommandHandlers } from '@indexer/events/genetic-data';
import { IndexerHandler } from '@indexer/indexer.handler';
import { IndexerModule } from '@indexer/indexer.module';
import { initializeApi } from '../../polkadot-init';
import { SecretKeyList } from '@common/secrets';

describe('Genetic Data Events', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
  let geneticData: GeneticData;
  let elasticsearchService: ElasticsearchService;

  const title = 'string';
  const desc = 'string';
  const link = 'string';
  const updatedTitle = 'string';

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
        CommonModule,
        ProcessEnvModule,
        CqrsModule,
        ScheduleModule.forRoot(),
        IndexerModule,
      ],
      providers: [IndexerHandler, ...GeneticDataCommandHandlers],
    })
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

  it('add genetic data', async () => {
    const addGeneticDataPromise: Promise<GeneticData> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        addGeneticData(api, pair, title, desc, link, () => {
          queryGeneticDataByOwnerId(api, pair.address).then((res) => {
            resolve(res.at(-1));
          });
        });
      },
    );

    geneticData = await addGeneticDataPromise;

    expect(geneticData.title).toEqual(title);
    expect(geneticData.description).toEqual(desc);
    expect(geneticData.reportLink).toEqual(link);
    expect(geneticData.ownerId).toEqual(pair.address);

    const esGeneticData = await elasticsearchService.search({
      index: 'genetic-data',
      body: {
        query: {
          match: {
            _id: {
              query: geneticData.id,
            },
          },
        },
      },
    });

    expect(esGeneticData.body.hits.hits.length).toEqual(1);

    const geneticDataSource = esGeneticData.body.hits.hits[0]._source;

    expect(geneticDataSource['id']).toEqual(geneticData.id);
    expect(geneticDataSource['owner_id']).toEqual(pair.address);
    expect(geneticDataSource['title']).toEqual(title);
    expect(geneticDataSource['description']).toEqual(desc);
    expect(geneticDataSource['report_link']).toEqual(link);
  }, 120000);

  it('update genetic data', async () => {
    const updateGeneticDataPromise: Promise<GeneticData> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        updateGeneticData(
          api,
          pair,
          geneticData.id,
          updatedTitle,
          desc,
          link,
          () => {
            queryGeneticDataByOwnerId(api, pair.address).then((res) => {
              resolve(res.at(-1));
            });
          },
        );
      },
    );

    geneticData = await updateGeneticDataPromise;

    expect(geneticData.title).toEqual(updatedTitle);
    expect(geneticData.description).toEqual(desc);
    expect(geneticData.reportLink).toEqual(link);
    expect(geneticData.ownerId).toEqual(pair.address);

    const esGeneticData = await elasticsearchService.search({
      index: 'genetic-data',
      body: {
        query: {
          match: {
            _id: {
              query: geneticData.id,
            },
          },
        },
      },
    });

    expect(esGeneticData.body.hits.hits.length).toEqual(1);

    const geneticDataSource = esGeneticData.body.hits.hits[0]._source;

    expect(geneticDataSource['id']).toEqual(geneticData.id);
    expect(geneticDataSource['owner_id']).toEqual(pair.address);
    expect(geneticDataSource['title']).toEqual(updatedTitle);
    expect(geneticDataSource['description']).toEqual(desc);
    expect(geneticDataSource['report_link']).toEqual(link);
  }, 120000);

  it('remove genetic data', async () => {
    const removeGeneticDataPromise: Promise<number> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        removeGeneticData(api, pair, geneticData.id, () => {
          queryGeneticDataCountByOwner(api, pair.address).then((res) => {
            resolve(res);
          });
        });
      },
    );

    const countGeneticData = await removeGeneticDataPromise;

    expect(countGeneticData).toEqual(0);

    const countEsGeneticData = await elasticsearchService.count({
      index: 'genetic-data',
      body: {
        query: {
          match: {
            _id: {
              query: geneticData.id,
            },
          },
        },
      },
    });

    expect(countEsGeneticData.body.count).toEqual(0);
  }, 80000);
});
