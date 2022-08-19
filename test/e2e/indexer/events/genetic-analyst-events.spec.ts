import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
import {
  deregisterGeneticAnalyst,
  GeneticAnalyst,
  queryGeneticAnalystByAccountId,
  queryGeneticAnalystCount,
  registerGeneticAnalyst,
  retrieveGeneticAnalystUnstakeAmount,
  stakeGeneticAnalyst,
  unstakeGeneticAnalyst,
  updateGeneticAnalyst,
  updateGeneticAnalystAvailabilityStatus,
  updateGeneticAnalystVerificationStatus,
} from '@debionetwork/polkadot-provider';
import { INestApplication } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiPromise } from '@polkadot/api';
import { initializeApi } from '../../polkadot-init';
import { CommonModule, ProcessEnvModule } from '../../../../src/common';
import { GeneticAnalystsCommandHandlers } from '../../../../src/indexer/events/genetic-analysts';
import { IndexerHandler } from '../../../../src/indexer/indexer.handler';
import { IndexerModule } from '../../../../src/indexer/indexer.module';
import { geneticAnalystsDataMock } from '../../../mock/models/genetic-analysts/genetic-analysts.mock';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';
import { AvailabilityStatus } from '@debionetwork/polkadot-provider/lib/primitives/availability-status';
import { StakeStatus } from '../../../../src/indexer/models/stake-status';
import { SecretKeyList } from '../../../../src/secrets';

describe('Genetic Analyst Events', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
  let ga: GeneticAnalyst;
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
        GCloudSecretManagerModule.withConfig(process.env.PARENT, SecretKeyList),
        CommonModule,
        ProcessEnvModule,
        CqrsModule,
        ScheduleModule.forRoot(),
        IndexerModule,
      ],
      providers: [IndexerHandler, ...GeneticAnalystsCommandHandlers],
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

  it('register genetic analyst', async () => {
    const { info } = geneticAnalystsDataMock;
    const registerGeneticAnalystPromise: Promise<GeneticAnalyst> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        registerGeneticAnalyst(api, pair, info, () => {
          queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
            resolve(res);
          });
        });
      },
    );

    ga = (await registerGeneticAnalystPromise).normalize();

    expect(ga.info).toEqual(info);

    const esGeneticAnalyst = await elasticsearchService.search({
      index: 'genetic-analysts',
      body: {
        query: {
          match: {
            _id: {
              query: ga.accountId,
            },
          },
        },
      },
    });

    expect(esGeneticAnalyst.body.hits.hits.length).toEqual(1);

    const geneticAnalystSource = esGeneticAnalyst.body.hits.hits[0]._source;

    expect(geneticAnalystSource['info']['first_name']).toEqual(
      ga.info.firstName,
    );
    expect(geneticAnalystSource['info']['last_name']).toEqual(ga.info.lastName);
    expect(geneticAnalystSource['info']['gender']).toEqual(ga.info.gender);
    expect(Number(geneticAnalystSource['info']['date_of_birth'])).toEqual(
      ga.info.dateOfBirth,
    );
    expect(geneticAnalystSource['info']['email']).toEqual(ga.info.email);
    expect(geneticAnalystSource['info']['phone_number']).toEqual(
      ga.info.phoneNumber,
    );
    expect(geneticAnalystSource['info']['specialization']).toEqual(
      ga.info.specialization,
    );
    expect(geneticAnalystSource['info']['profile_link']).toEqual(
      ga.info.profileLink,
    );
    expect(geneticAnalystSource['info']['profile_image']).toEqual(
      ga.info.profileImage,
    );
  }, 120000);

  it('stake successful genetic analyst', async () => {
    ga = null;

    const { info } = geneticAnalystsDataMock;
    const stakeGeneticAnalystPromise: Promise<GeneticAnalyst> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        stakeGeneticAnalyst(api, pair, () => {
          queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
            resolve(res);
          });
        });
      },
    );

    ga = (await stakeGeneticAnalystPromise).normalize();

    expect(ga.info).toEqual(info);
    expect(ga.stakeStatus).toEqual(StakeStatus.Staked);

    const esGeneticAnalyst = await elasticsearchService.search({
      index: 'genetic-analysts',
      body: {
        query: {
          match: {
            _id: {
              query: ga.accountId,
            },
          },
        },
      },
    });

    expect(esGeneticAnalyst.body.hits.hits.length).toEqual(1);

    const geneticAnalystSource = esGeneticAnalyst.body.hits.hits[0]._source;

    expect(geneticAnalystSource['info']['first_name']).toEqual(info.firstName);
    expect(geneticAnalystSource['info']['last_name']).toEqual(info.lastName);
    expect(geneticAnalystSource['info']['gender']).toEqual(info.gender);
    expect(Number(geneticAnalystSource['info']['date_of_birth'])).toEqual(
      info.dateOfBirth,
    );
    expect(geneticAnalystSource['info']['email']).toEqual(info.email);
    expect(geneticAnalystSource['info']['phone_number']).toEqual(
      info.phoneNumber,
    );
    expect(geneticAnalystSource['info']['specialization']).toEqual(
      info.specialization,
    );
    expect(geneticAnalystSource['info']['profile_link']).toEqual(
      info.profileLink,
    );
    expect(geneticAnalystSource['info']['profile_image']).toEqual(
      info.profileImage,
    );
    expect(geneticAnalystSource['stake_status']).toEqual(StakeStatus.Staked);
  }, 120000);

  it('update verification status', async () => {
    ga = null;

    const { info } = geneticAnalystsDataMock;
    const updateVerificationStatusPromise: Promise<GeneticAnalyst> =
      // eslint-disable-next-line
      new Promise((resolve, reject) => {
        updateGeneticAnalystVerificationStatus(
          api,
          pair,
          pair.address,
          VerificationStatus.Verified,
          () => {
            queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
              resolve(res);
            });
          },
        );
      });

    ga = (await updateVerificationStatusPromise).normalize();

    expect(ga.info).toEqual(info);
    expect(ga.verificationStatus).toEqual(VerificationStatus.Verified);

    const esGeneticAnalyst = await elasticsearchService.search({
      index: 'genetic-analysts',
      body: {
        query: {
          match: {
            _id: {
              query: ga.accountId,
            },
          },
        },
      },
    });

    expect(esGeneticAnalyst.body.hits.hits.length).toEqual(1);

    const geneticAnalystSource = esGeneticAnalyst.body.hits.hits[0]._source;

    expect(geneticAnalystSource['info']['first_name']).toEqual(info.firstName);
    expect(geneticAnalystSource['info']['last_name']).toEqual(info.lastName);
    expect(geneticAnalystSource['info']['gender']).toEqual(info.gender);
    expect(Number(geneticAnalystSource['info']['date_of_birth'])).toEqual(
      info.dateOfBirth,
    );
    expect(geneticAnalystSource['info']['email']).toEqual(info.email);
    expect(geneticAnalystSource['info']['phone_number']).toEqual(
      info.phoneNumber,
    );
    expect(geneticAnalystSource['info']['specialization']).toEqual(
      info.specialization,
    );
    expect(geneticAnalystSource['info']['profile_link']).toEqual(
      info.profileLink,
    );
    expect(geneticAnalystSource['info']['profile_image']).toEqual(
      info.profileImage,
    );
    expect(geneticAnalystSource['verification_status']).toEqual(
      VerificationStatus.Verified,
    );
  }, 120000);

  it('update genetic analyst', async () => {
    ga = null;

    const { info } = geneticAnalystsDataMock;
    const updateGeneticAnalystPromise: Promise<GeneticAnalyst> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        updateGeneticAnalyst(
          api,
          pair,
          { ...info, firstName: 'string2' },
          () => {
            queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
              resolve(res);
            });
          },
        );
      },
    );

    ga = (await updateGeneticAnalystPromise).normalize();

    expect(ga.info).toEqual({ ...info, firstName: 'string2' });
    expect(ga.verificationStatus).toEqual(VerificationStatus.Verified);

    const esGeneticAnalyst = await elasticsearchService.search({
      index: 'genetic-analysts',
      body: {
        query: {
          match: {
            _id: {
              query: ga.accountId,
            },
          },
        },
      },
    });

    expect(esGeneticAnalyst.body.hits.hits.length).toEqual(1);

    const geneticAnalystSource = esGeneticAnalyst.body.hits.hits[0]._source;

    expect(geneticAnalystSource['info']['first_name']).toEqual('string2');
    expect(geneticAnalystSource['info']['last_name']).toEqual(info.lastName);
    expect(geneticAnalystSource['info']['gender']).toEqual(info.gender);
    expect(Number(geneticAnalystSource['info']['date_of_birth'])).toEqual(
      info.dateOfBirth,
    );
    expect(geneticAnalystSource['info']['email']).toEqual(info.email);
    expect(geneticAnalystSource['info']['phone_number']).toEqual(
      info.phoneNumber,
    );
    expect(geneticAnalystSource['info']['specialization']).toEqual(
      info.specialization,
    );
    expect(geneticAnalystSource['info']['profile_link']).toEqual(
      info.profileLink,
    );
    expect(geneticAnalystSource['info']['profile_image']).toEqual(
      info.profileImage,
    );
    expect(geneticAnalystSource['verification_status']).toEqual(
      VerificationStatus.Verified,
    );
  }, 120000);

  it('unstake successful genetic analyst', async () => {
    ga = null;

    const { info } = geneticAnalystsDataMock;
    const unstakeGeneticAnalystPromise: Promise<GeneticAnalyst> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        unstakeGeneticAnalyst(api, pair, () => {
          queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
            resolve(res);
          });
        });
      },
    );

    ga = (await unstakeGeneticAnalystPromise).normalize();

    expect(ga.info).toEqual({ ...info, firstName: 'string2' });
    expect(ga.stakeStatus).toEqual(StakeStatus.WaitingForUnstaked);

    const esGeneticAnalyst = await elasticsearchService.search({
      index: 'genetic-analysts',
      body: {
        query: {
          match: {
            _id: {
              query: ga.accountId,
            },
          },
        },
      },
    });

    expect(esGeneticAnalyst.body.hits.hits.length).toEqual(1);

    const geneticAnalystSource = esGeneticAnalyst.body.hits.hits[0]._source;

    expect(geneticAnalystSource['info']['first_name']).toEqual('string2');
    expect(geneticAnalystSource['info']['last_name']).toEqual(info.lastName);
    expect(geneticAnalystSource['info']['gender']).toEqual(info.gender);
    expect(Number(geneticAnalystSource['info']['date_of_birth'])).toEqual(
      info.dateOfBirth,
    );
    expect(geneticAnalystSource['info']['email']).toEqual(info.email);
    expect(geneticAnalystSource['info']['phone_number']).toEqual(
      info.phoneNumber,
    );
    expect(geneticAnalystSource['info']['specialization']).toEqual(
      info.specialization,
    );
    expect(geneticAnalystSource['info']['profile_link']).toEqual(
      info.profileLink,
    );
    expect(geneticAnalystSource['info']['profile_image']).toEqual(
      info.profileImage,
    );
    expect(geneticAnalystSource['stake_status']).toEqual(
      StakeStatus.WaitingForUnstaked,
    );
  }, 120000);

  it('retrieve unstake amount genetic analyst', async () => {
    ga = null;

    const { info } = geneticAnalystsDataMock;
    const unstakeGeneticAnalystPromise: Promise<GeneticAnalyst> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        retrieveGeneticAnalystUnstakeAmount(api, pair, pair.address, () => {
          queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
            resolve(res);
          });
        });
      },
    );

    ga = (await unstakeGeneticAnalystPromise).normalize();

    expect(ga.info).toEqual({ ...info, firstName: 'string2' });
    expect(ga.verificationStatus).toEqual(VerificationStatus.Verified);
    expect(ga.stakeStatus).toEqual(StakeStatus.Unstaked);

    const esGeneticAnalyst = await elasticsearchService.search({
      index: 'genetic-analysts',
      body: {
        query: {
          match: {
            _id: {
              query: ga.accountId,
            },
          },
        },
      },
    });

    expect(esGeneticAnalyst.body.hits.hits.length).toEqual(1);

    const geneticAnalystSource = esGeneticAnalyst.body.hits.hits[0]._source;

    expect(geneticAnalystSource['info']['first_name']).toEqual('string2');
    expect(geneticAnalystSource['info']['last_name']).toEqual(info.lastName);
    expect(geneticAnalystSource['info']['gender']).toEqual(info.gender);
    expect(Number(geneticAnalystSource['info']['date_of_birth'])).toEqual(
      info.dateOfBirth,
    );
    expect(geneticAnalystSource['info']['email']).toEqual(info.email);
    expect(geneticAnalystSource['info']['phone_number']).toEqual(
      info.phoneNumber,
    );
    expect(geneticAnalystSource['info']['specialization']).toEqual(
      info.specialization,
    );
    expect(geneticAnalystSource['info']['profile_link']).toEqual(
      info.profileLink,
    );
    expect(geneticAnalystSource['info']['profile_image']).toEqual(
      info.profileImage,
    );
    expect(geneticAnalystSource['verification_status']).toEqual(
      VerificationStatus.Verified,
    );
    expect(geneticAnalystSource['stake_status']).toEqual(StakeStatus.Unstaked);
  }, 120000);

  it('update availability status', async () => {
    ga = null;

    const { info } = geneticAnalystsDataMock;
    const updateAvailabilityStatusPromise: Promise<GeneticAnalyst> =
      // eslint-disable-next-line
      new Promise((resolve, reject) => {
        updateGeneticAnalystAvailabilityStatus(
          api,
          pair,
          AvailabilityStatus.Unavailable,
          () => {
            queryGeneticAnalystByAccountId(api, pair.address).then((res) => {
              resolve(res);
            });
          },
        );
      });

    ga = (await updateAvailabilityStatusPromise).normalize();

    expect(ga.info).toEqual({ ...info, firstName: 'string2' });
    expect(ga.verificationStatus).toEqual(VerificationStatus.Verified);
    expect(ga.availabilityStatus).toEqual(AvailabilityStatus.Unavailable);

    const esGeneticAnalyst = await elasticsearchService.search({
      index: 'genetic-analysts',
      body: {
        query: {
          match: {
            _id: {
              query: ga.accountId,
            },
          },
        },
      },
    });

    expect(esGeneticAnalyst.body.hits.hits.length).toEqual(1);

    const geneticAnalystSource = esGeneticAnalyst.body.hits.hits[0]._source;

    expect(geneticAnalystSource['info']['first_name']).toEqual('string2');
    expect(geneticAnalystSource['info']['last_name']).toEqual(info.lastName);
    expect(geneticAnalystSource['info']['gender']).toEqual(info.gender);
    expect(Number(geneticAnalystSource['info']['date_of_birth'])).toEqual(
      info.dateOfBirth,
    );
    expect(geneticAnalystSource['info']['email']).toEqual(info.email);
    expect(geneticAnalystSource['info']['phone_number']).toEqual(
      info.phoneNumber,
    );
    expect(geneticAnalystSource['info']['specialization']).toEqual(
      info.specialization,
    );
    expect(geneticAnalystSource['info']['profile_link']).toEqual(
      info.profileLink,
    );
    expect(geneticAnalystSource['info']['profile_image']).toEqual(
      info.profileImage,
    );
    expect(geneticAnalystSource['verification_status']).toEqual(
      VerificationStatus.Verified,
    );
    expect(geneticAnalystSource['availability_status']).toEqual(
      AvailabilityStatus.Unavailable,
    );
  }, 120000);

  it('deregister genetic analyst', async () => {
    const deregisterGeneticAnalystPromise: Promise<number> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        deregisterGeneticAnalyst(api, pair, () => {
          queryGeneticAnalystCount(api).then((res) => {
            resolve(res);
          });
        });
      },
    );

    const countGeneticAnalyst = await deregisterGeneticAnalystPromise;
    expect(countGeneticAnalyst).toEqual(0);

    const countEsGeneticAnalyst = await elasticsearchService.count({
      index: 'genetic-analysts',
      body: {
        query: {
          match: {
            _id: {
              query: ga.accountId,
            },
          },
        },
      },
    });

    expect(countEsGeneticAnalyst.body.count).toEqual(0);
  }, 80000);
});
