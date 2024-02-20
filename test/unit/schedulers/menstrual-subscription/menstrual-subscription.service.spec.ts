import { SubstrateService } from '@common/substrate';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { MenstrualSubscriptionService } from '@schedulers/menstrual-subscription/menstrual-subscription.service';
import {
  elasticsearchServiceMockFactory,
  MockLogger,
  MockType,
  schedulerRegistryMockFactory,
  substrateServiceMockFactory,
} from '../../mock';
import * as schedulersTools from '@common/tools/schedulers';

describe('Menstrual Subscription Service', () => {
  let menstrualSubscriptionService: MockType<MenstrualSubscriptionService>;
  let elasticsearchServiceMock: MockType<ElasticsearchService>;
  let substrateServiceMock: MockType<SubstrateService>;
  let schedulerRegistryMock: MockType<SchedulerRegistry>;

  const MENSTRUAL_SUBSCRIPTION_DURATION =
    process?.env?.MENSTRUAL_SUBSCRIPTION_DURATION ??
    '{"Monthly": "30:00:00:00", "Quarterly": "90:00:00:00", "Yearly": "365:00:00:00"}';
  const INTERVAL = '00:00:00:30';
  const TIMER = '6:00:00:00';

  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['MENSTRUAL_SUBSCRIPTION_DURATION', MENSTRUAL_SUBSCRIPTION_DURATION],
      ['UNSTAKE_INTERVAL', INTERVAL],
      ['UNSTAKE_TIMER', TIMER],
    ]);
    loadSecrets() {
      return null;
    }

    getSecret(key) {
      return this._secretsList.get(key);
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenstrualSubscriptionService,
        {
          provide: ElasticsearchService,
          useFactory: elasticsearchServiceMockFactory,
        },
        {
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory,
        },
        {
          provide: SchedulerRegistry,
          useFactory: schedulerRegistryMockFactory,
        },
      ],
    }).compile();
    module.useLogger(MockLogger);

    menstrualSubscriptionService = module.get(MenstrualSubscriptionService);
    // eslint-disable-next-line
    elasticsearchServiceMock = module.get(ElasticsearchService);
    // eslint-disable-next-line
    substrateServiceMock = module.get(SubstrateService);
    schedulerRegistryMock = module.get(SchedulerRegistry);
  });

  afterAll(() => {
    // eslint-disable-next-line
    schedulerRegistryMock = null;
  });

  it('should return 30 days in milisecond', () => {
    const PARAM = '06:00:00:00';
    const EXPECTED_RETURN = 6 * 24 * 60 * 60 * 1000;

    expect(schedulersTools.strToMilisecond(PARAM)).toBe(EXPECTED_RETURN);
  });

  it('should parse mesntrual subscription duration env value', () => {
    expect(
      menstrualSubscriptionService.parseMenstrualSubscriptionDuration(),
    ).toEqual(
      expect.objectContaining({
        Monthly: 30 * 24 * 60 * 60 * 1000,
        Quarterly: 3 * 30 * 24 * 60 * 60 * 1000,
        Yearly: 365 * 24 * 60 * 60 * 1000,
      }),
    );
  });
});
