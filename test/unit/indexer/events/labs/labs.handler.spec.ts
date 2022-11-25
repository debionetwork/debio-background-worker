import { Test, TestingModule } from '@nestjs/testing';
import {
  LabCommandHandlers,
  LabDeregisteredCommandIndexer,
  LabRegisteredCommandIndexer,
  LabRetrieveUnstakeAmountCommandIndexer,
  LabStakeSuccessfulCommandIndexer,
  LabUnstakeSuccessfulCommandIndexer,
  LabUpdatedCommandIndexer,
  LabUpdateVerificationStatusCommandIndexer,
} from '@indexer/events/labs';
import { LabDeregisteredHandler } from '@indexer/events/labs/commands/lab-deregistered/lab-deregistered.handler';
import { LabRegisteredHandler } from '@indexer/events/labs/commands/lab-registered/lab-registered.handler';
import { LabUpdatedHandler } from '@indexer/events/labs/commands/lab-updated/lab-updated.handler';
import { LabUpdateVerificationStatusHandler } from '@indexer/events/labs/commands/lab-update-verification-status/lab-update-verification-status.handler';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { BlockMetaData } from '@indexer/models/block-meta-data';
import { ElasticSearchServiceProvider } from '../../../mock';
import { StakeStatus } from '@indexer/models/stake-status';
import { LabRetrieveUnstakeAmountHandler } from '@indexer/events/labs/commands/lab-retrieve-unstake-amount/lab-retrieve-unstake-amount.handler';
import { LabStakeSuccessfulHandler } from '@indexer/events/labs/commands/lab-stake-successful/lab-stake-successful.handler';
import { LabUnstakeSuccessfulHandler } from '@indexer/events/labs/commands/lab-unstake-successful/lab-unstake-successful.handler';

let labDeregisteredHandler: LabDeregisteredHandler;
let labRegisteredHandler: LabRegisteredHandler;
let labUpdatedHandler: LabUpdatedHandler;
let labUpdateVerificationStatusHandler: LabUpdateVerificationStatusHandler;
let labRetrieveUnstakeAmountHandler: LabRetrieveUnstakeAmountHandler;
let labStakeSuccessfulHandler: LabStakeSuccessfulHandler;
let labUnstakeSuccessfulHandler: LabUnstakeSuccessfulHandler;

let elasticsearchService: ElasticsearchService;
describe('Labs Substrate Event Handler', () => {
  const createMockLab = () => {
    const labInfo = {
      boxPublicKey: 'string',
      name: 'string',
      email: 'string',
      phoneNumber: 'string',
      website: 'string',
      country: 'XX',
      region: 'XX',
      city: 'XX',
      address: 'string',
      latitude: 'string',
      longitude: 'string',
      profileImage: 'string',
    };

    return {
      toHuman: jest.fn(() => ({
        accountId: 'string',
        services: [1],
        certifications: [1],
        verificationStatus: [1],
        info: labInfo,
        stakeAmount: '1000000',
        stakeStatus: StakeStatus.Staked,
        unstakeAt: '100000000',
        retrieveUnstakeAt: '100000000',
      })),
    };
  };

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: '',
      blockNumber: 1,
    };
  }

  beforeAll(async () => {
    const modules: TestingModule = await Test.createTestingModule({
      providers: [ElasticSearchServiceProvider, ...LabCommandHandlers],
    }).compile();

    labDeregisteredHandler = modules.get<LabDeregisteredHandler>(
      LabDeregisteredHandler,
    );
    labRegisteredHandler =
      modules.get<LabRegisteredHandler>(LabRegisteredHandler);
    labUpdatedHandler = modules.get<LabUpdatedHandler>(LabUpdatedHandler);
    labUpdateVerificationStatusHandler =
      modules.get<LabUpdateVerificationStatusHandler>(
        LabUpdateVerificationStatusHandler,
      );
    labRetrieveUnstakeAmountHandler =
      modules.get<LabRetrieveUnstakeAmountHandler>(
        LabRetrieveUnstakeAmountHandler,
      );
    labStakeSuccessfulHandler = modules.get<LabStakeSuccessfulHandler>(
      LabStakeSuccessfulHandler,
    );
    labUnstakeSuccessfulHandler = modules.get<LabUnstakeSuccessfulHandler>(
      LabUnstakeSuccessfulHandler,
    );

    elasticsearchService =
      modules.get<ElasticsearchService>(ElasticsearchService);

    await modules.init();
  });

  describe('Lab Handler', () => {
    it('Lab Deregistered Handler', async () => {
      const lab = createMockLab();

      const labDeregisteredCommand: LabDeregisteredCommandIndexer =
        new LabDeregisteredCommandIndexer([lab], mockBlockNumber());
      await labDeregisteredHandler.execute(labDeregisteredCommand);
      expect(elasticsearchService.delete).toHaveBeenCalled();
      expect(elasticsearchService.deleteByQuery).toHaveBeenCalled();
    });

    it('Lab Registered Handler', async () => {
      const lab = createMockLab();

      const labRegisteredCommand: LabRegisteredCommandIndexer =
        new LabRegisteredCommandIndexer([lab], mockBlockNumber());
      await labRegisteredHandler.execute(labRegisteredCommand);
      expect(elasticsearchService.index).toHaveBeenCalled();
    });

    it('Lab Updated Handler', async () => {
      const lab = createMockLab();

      const labUpdatedCommand: LabUpdatedCommandIndexer =
        new LabUpdatedCommandIndexer([lab], mockBlockNumber());
      await labUpdatedHandler.execute(labUpdatedCommand);
      expect(elasticsearchService.update).toHaveBeenCalled();
    });

    it('Lab Updated Verification Status Handler', async () => {
      const lab = createMockLab();

      const labUpdatedVerificationStatusCommand: LabUpdateVerificationStatusCommandIndexer =
        new LabUpdateVerificationStatusCommandIndexer([lab], mockBlockNumber());
      await labUpdateVerificationStatusHandler.execute(
        labUpdatedVerificationStatusCommand,
      );
      expect(elasticsearchService.update).toHaveBeenCalled();
    });

    it('Lab Retrieve Unstake Amount Handler', async () => {
      const lab = createMockLab();

      const labRetrieveUnstakeAmountCommand: LabRetrieveUnstakeAmountCommandIndexer =
        new LabRetrieveUnstakeAmountCommandIndexer([lab], mockBlockNumber());
      await labRetrieveUnstakeAmountHandler.execute(
        labRetrieveUnstakeAmountCommand,
      );
      expect(elasticsearchService.update).toHaveBeenCalled();
    });

    it('Lab Stake Successful Handler', async () => {
      const lab = createMockLab();

      const labStakeSuccessfulCommand: LabStakeSuccessfulCommandIndexer =
        new LabStakeSuccessfulCommandIndexer([lab], mockBlockNumber());
      await labStakeSuccessfulHandler.execute(labStakeSuccessfulCommand);
      expect(elasticsearchService.update).toHaveBeenCalled();
    });

    it('Lab Unstake Successful Handler', async () => {
      const lab = createMockLab();

      const labUnstakeSuccessfulCommand: LabUnstakeSuccessfulCommandIndexer =
        new LabUnstakeSuccessfulCommandIndexer([lab], mockBlockNumber());
      await labUnstakeSuccessfulHandler.execute(labUnstakeSuccessfulCommand);
      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });
});
