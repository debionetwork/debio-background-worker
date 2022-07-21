import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import { ElasticSearchServiceProvider } from '../../../mock';
import {
  GeneticAnalystsCommandHandlers,
  GeneticAnalystsRegisteredCommandIndexer,
  GeneticAnalystsDeletedCommandIndexer,
  GeneticAnalystsUpdatedCommandIndexer,
  GeneticAnalystsStakeSuccessfulCommandIndexer,
  GeneticAnalystsUpdateVerificationStatusCommandIndexer,
  GeneticAnalystsRetrieveUnstakeAmountCommandIndexer,
  GeneticAnalystsUpdateAvailabilityStatusCommandIndexer,
  GeneticAnalystUnstakeSuccessfulCommandIndexer,
  GeneticAnalystVerificationFailedCommandIndexer,
} from '../../../../../src/indexer/events/genetic-analysts';
import { GeneticAnalystsRegisteredHandler } from '../../../../../src/indexer/events/genetic-analysts/commands/genetic-analysts-registered/genetic-analysts-registered.handler';
import { GeneticAnalystsDeletedHandler } from '../../../../../src/indexer/events/genetic-analysts/commands/genetic-analysts-deleted/genetic-analysts-deleted.handler';
import { GeneticAnalystsUpdatedHandler } from '../../../../../src/indexer/events/genetic-analysts/commands/genetic-analysts-updated/genetic-analysts-updated.handler';

import { BlockMetaData } from '../../../../../src/indexer/models/block-meta-data';
import { GeneticAnalystsStakeSuccessfulHandler } from '../../../../../src/indexer/events/genetic-analysts/commands/genetic-analysts-stake-successful/genetic-analysts-stake-successful.handler';
import { GeneticAnalystsUpdateVerificationStatusHandler } from '../../../../../src/indexer/events/genetic-analysts/commands/genetic-analysts-update-verification-status/genetic-analysts-update-verification-status.handler';
import { GeneticAnalystsRetrieveUnstakeAmountHandler } from '../../../../../src/indexer/events/genetic-analysts/commands/genetic-analysts-retrieve-unstake-amount/genetic-analysts-retrieve-unstake-amount.handler';
import { GeneticAnalystsUpdateAvailabilityStatusHandler } from '../../../../../src/indexer/events/genetic-analysts/commands/genetic-analysts-update-availability-status/genetic-analysts-update-availability-status.handler';
import { GeneticAnalystUnstakeSuccessfulHandler } from '../../../../../src/indexer/events/genetic-analysts/commands/genetic-analysts-unstake-successful/genetic-analysts-unstake-successful.handler';
import { GeneticAnalystVerificationFailedHandler } from '../../../../../src/indexer/events/genetic-analysts/commands/genetic-analysts-verification-failed/genetic-analysts-verification-failed.handler';

describe('Genetic Anlaysts Substrate Event Handler', () => {
  let elasticsearchService: ElasticsearchService;

  let geneticAnalystsRegisteredHandler: GeneticAnalystsRegisteredHandler;
  let geneticAnalystsDeletedHandler: GeneticAnalystsDeletedHandler;
  let geneticAnalystsUpdatedHandler: GeneticAnalystsUpdatedHandler;
  let geneticAnalystsStakeSuccessfulHandler: GeneticAnalystsStakeSuccessfulHandler;
  let geneticAnalystsUpdateVerificationStatusHandler: GeneticAnalystsUpdateVerificationStatusHandler;
  let geneticAnalystsUpdateAvailabilityStatusHandler: GeneticAnalystsUpdateAvailabilityStatusHandler;
  let geneticAnalystsRetrieveUnstakeAmountHandler: GeneticAnalystsRetrieveUnstakeAmountHandler;
  let geneticAnalystsUnstakeSuccessfulHandler: GeneticAnalystUnstakeSuccessfulHandler;
  let geneticAnalystsVerificationFailedHandler: GeneticAnalystVerificationFailedHandler;

  const createMockGeneticAnalysts = (services, qualifications) => {
    return {
      toHuman: jest.fn(() => ({
        accountId: 'string',
        services: services,
        qualifications: qualifications,
        info: {
          firstName: 'string',
          lastName: 'string',
          gender: 'string',
          dateOfBirth: 'xx',
          email: 'string',
          phoneNumber: 'xx',
          specialization: 'string',
          stakeAmount: 0,
          stakeStatus: 'string',
          profileLink: 'string',
          profileImage: 'string',
        },
      })),
    };
  };

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: '',
      blockNumber: 1,
    };
  }

  beforeEach(async () => {
    const modules: TestingModule = await Test.createTestingModule({
      providers: [
        ElasticSearchServiceProvider,
        ...GeneticAnalystsCommandHandlers,
      ],
    }).compile();

    elasticsearchService = modules.get(ElasticsearchService);

    geneticAnalystsRegisteredHandler = modules.get(
      GeneticAnalystsRegisteredHandler,
    );
    geneticAnalystsDeletedHandler = modules.get(GeneticAnalystsDeletedHandler);
    geneticAnalystsUpdatedHandler = modules.get(GeneticAnalystsUpdatedHandler);

    geneticAnalystsStakeSuccessfulHandler = modules.get(
      GeneticAnalystsStakeSuccessfulHandler,
    );
    geneticAnalystsUpdateVerificationStatusHandler = modules.get(
      GeneticAnalystsUpdateVerificationStatusHandler,
    );
    geneticAnalystsUpdateAvailabilityStatusHandler = modules.get(
      GeneticAnalystsUpdateAvailabilityStatusHandler,
    );
    geneticAnalystsRetrieveUnstakeAmountHandler = modules.get(
      GeneticAnalystsRetrieveUnstakeAmountHandler,
    );
    geneticAnalystsUnstakeSuccessfulHandler = modules.get(
      GeneticAnalystUnstakeSuccessfulHandler,
    );
    geneticAnalystsVerificationFailedHandler = modules.get(
      GeneticAnalystVerificationFailedHandler,
    );
  });

  describe('Genetic Analysts Created', () => {
    it('should Genetic create index Analysts', async () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts([], []);

      const geneticAnalystsRegisteredCommand: GeneticAnalystsRegisteredCommandIndexer =
        new GeneticAnalystsRegisteredCommandIndexer(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalystsRegisteredHandler.execute(
        geneticAnalystsRegisteredCommand,
      );

      expect(elasticsearchService.index).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysts Deleted', () => {
    it('should delete index Genetic Analysts', async () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts([], []);

      const geneticAnalystsDeletedCommand: GeneticAnalystsDeletedCommandIndexer =
        new GeneticAnalystsDeletedCommandIndexer(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalystsDeletedHandler.execute(
        geneticAnalystsDeletedCommand,
      );

      expect(elasticsearchService.delete).toHaveBeenCalled();
      expect(elasticsearchService.deleteByQuery).not.toHaveBeenCalled();
    });

    it('should delete index Genetic Analysts and delete index qualification and service include in genetic analysts', async () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts([1], [1]);

      const geneticAnalystsDeletedCommand: GeneticAnalystsDeletedCommandIndexer =
        new GeneticAnalystsDeletedCommandIndexer(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalystsDeletedHandler.execute(
        geneticAnalystsDeletedCommand,
      );

      expect(elasticsearchService.delete).toHaveBeenCalled();
      expect(elasticsearchService.deleteByQuery).toHaveBeenCalledTimes(2);
    });
  });

  describe('Genetic Analysts Updated', () => {
    it('should update index Genetic Analysts', async () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts([], []);

      const geneticAnalystsUpdatedCommand: GeneticAnalystsUpdatedCommandIndexer =
        new GeneticAnalystsUpdatedCommandIndexer(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalystsUpdatedHandler.execute(
        geneticAnalystsUpdatedCommand,
      );

      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysts Stake Successful', () => {
    it('should update index Genetic Analysts', async () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts([], []);

      const geneticAnalystsStakeSuccessfulCommand: GeneticAnalystsStakeSuccessfulCommandIndexer =
        new GeneticAnalystsStakeSuccessfulCommandIndexer(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalystsStakeSuccessfulHandler.execute(
        geneticAnalystsStakeSuccessfulCommand,
      );

      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysts Update verification status', () => {
    it('should update index Genetic Analysts', async () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts([], []);

      const geneticAnalystsUpdateVerificationStatusCommand: GeneticAnalystsUpdateVerificationStatusCommandIndexer =
        new GeneticAnalystsUpdateVerificationStatusCommandIndexer(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalystsUpdateVerificationStatusHandler.execute(
        geneticAnalystsUpdateVerificationStatusCommand,
      );

      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysts Update availability status', () => {
    it('should update index Genetic Analysts', async () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts([], []);

      const geneticAnalystsUpdateAvailabilityStatusCommand: GeneticAnalystsUpdateAvailabilityStatusCommandIndexer =
        new GeneticAnalystsUpdateAvailabilityStatusCommandIndexer(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalystsUpdateAvailabilityStatusHandler.execute(
        geneticAnalystsUpdateAvailabilityStatusCommand,
      );

      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysts Retrieve Unstake Amount', () => {
    it('should update index Genetic Analysts', async () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts([], []);

      const geneticAnalystsRetrieveUnstakeAmountCommand: GeneticAnalystsRetrieveUnstakeAmountCommandIndexer =
        new GeneticAnalystsRetrieveUnstakeAmountCommandIndexer(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalystsRetrieveUnstakeAmountHandler.execute(
        geneticAnalystsRetrieveUnstakeAmountCommand,
      );

      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysts Unstake Successful', () => {
    it('should update index Genetic Analysts', async () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts([], []);

      const geneticAnalystsUnstakeSuccessfulCommand: GeneticAnalystUnstakeSuccessfulCommandIndexer =
        new GeneticAnalystUnstakeSuccessfulCommandIndexer(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalystsUnstakeSuccessfulHandler.execute(
        geneticAnalystsUnstakeSuccessfulCommand,
      );

      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysts Verification Failed', () => {
    it('should update index Genetic Analysts', async () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts([], []);

      const geneticAnalystsVerificationFailedCommand: GeneticAnalystVerificationFailedCommandIndexer =
        new GeneticAnalystVerificationFailedCommandIndexer(
          [GENETIC_ANALYSTS_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalystsVerificationFailedHandler.execute(
        geneticAnalystsVerificationFailedCommand,
      );

      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });
});
