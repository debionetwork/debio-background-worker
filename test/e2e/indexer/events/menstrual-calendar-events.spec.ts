import { INestApplication } from "@nestjs/common";
import { ApiPromise } from "@polkadot/api";
import { MenstrualCycleLog } from "../../../../src/indexer/models/menstrual-calendar/menstrual-cycle-log";
import { MenstrualCalendar } from "../../../../src/indexer/models/menstrual-calendar/menstrual-calendar";
import { Test, TestingModule } from "@nestjs/testing";
import { GCloudSecretManagerModule, GCloudSecretManagerService } from "@debionetwork/nestjs-gcloud-secret-manager";
import { SecretKeyList } from "../../../../src/common/secrets";
import { CommonModule, ProcessEnvModule } from "../../../../src/common";
import { CqrsModule } from "@nestjs/cqrs";
import { ScheduleModule } from "@nestjs/schedule";
import { IndexerModule } from "../../../../src/indexer/indexer.module";
import { IndexerHandler } from "../../../../src/indexer/indexer.handler";
import { MenstrualCalendarCommandHandlers } from "../../../../src/indexer/events/menstrual-calendar";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { initializeApi } from "../../polkadot-init";

describe("Menstrual Calendar Test Events", () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
  let elasticsearchService: ElasticsearchService;
  let menstrualCalendar: MenstrualCalendar;
  let menstrualCycleLog: MenstrualCycleLog;

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
      providers: [
        IndexerHandler,
        ...MenstrualCalendarCommandHandlers,
      ],
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

  it("Menstrual Calendar Added", async () => {
    //TODO: update polkadot provider for integration test
  });

  it("Menstrual Calendar Updated", async () => {
    //TODO: update polkadot provider for integration test
  });

  it("Menstrual Calendar Removed", async () => {
    //TODO: update polkadot provider for integration test
  });

  it("Menstrual Cycle Log Added", async () => {
    //TODO: update polkadot provider for integration test
  });

  it("Menstrual Cycle Log Updated", async () => {
    //TODO: update polkadot provider for integration test
  });

  it("Menstrual Cycle Log Removed", async () => {
    //TODO: update polkadot provider for integration test
  });
});