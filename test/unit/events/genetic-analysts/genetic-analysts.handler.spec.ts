import { ElasticsearchService } from "@nestjs/elasticsearch";
import { Test, TestingModule } from "@nestjs/testing";
import { ElasticSearchServiceProvider } from "../../mock";
import { GeneticAnalystsCommandHandlers,
GeneticAnalystsRegisteredCommand, GeneticAnalystsDeletedCommand, GeneticAnalystsUpdatedCommand } from "../../../../src/substrate/events/genetic-analysts";
import { GeneticAnalystsRegisteredHandler } from "../../../../src/substrate/events/genetic-analysts/commands/genetic-analysts-registered/genetic-analysts-registered.handler";
import { GeneticAnalystsDeletedHandler } from "../../../../src/substrate/events/genetic-analysts/commands/genetic-analysts-deleted/genetic-analysts-deleted.handler";
import { GeneticAnalystsUpdatedHandler } from "../../../../src/substrate/events/genetic-analysts/commands/genetic-analysts-updated/genetic-analysts-updated.handler";

import { BlockMetaData } from '../../../../src/substrate/models/blockMetaData';

describe('Genetic Anlaysts Substrate Event Handler', () => {
  let elasticsearchService: ElasticsearchService;

  let geneticAnalystsRegisteredHandler: GeneticAnalystsRegisteredHandler;
  let geneticAnalystsDeletedHandler: GeneticAnalystsDeletedHandler;
  let geneticAnalystsUpdatedHandler: GeneticAnalystsUpdatedHandler;
  
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
          stakeStatus: 'string'
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
        ...GeneticAnalystsCommandHandlers
      ]
    }).compile();

    elasticsearchService = modules.get(ElasticsearchService);
    
    geneticAnalystsRegisteredHandler = modules.get(GeneticAnalystsRegisteredHandler);
    geneticAnalystsDeletedHandler = modules.get(GeneticAnalystsDeletedHandler);
    geneticAnalystsUpdatedHandler = modules.get(GeneticAnalystsUpdatedHandler);
  });

  describe('Genetic Analysts Created', () => {

    it('should Genetic create index Analysts', async () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts([], []);

      const geneticAnalystsRegisteredCommand: GeneticAnalystsRegisteredCommand = 
        new GeneticAnalystsRegisteredCommand([GENETIC_ANALYSTS_PARAM], mockBlockNumber());

      await geneticAnalystsRegisteredHandler.execute(geneticAnalystsRegisteredCommand);

      expect(elasticsearchService.index).toHaveBeenCalled();
    });

  });

  describe('Genetic Analysts Deleted', () => {

    it('should delete index Genetic Analysts', async () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts([], []);

      const geneticAnalystsDeletedCommand: GeneticAnalystsDeletedCommand = 
        new GeneticAnalystsDeletedCommand([GENETIC_ANALYSTS_PARAM], mockBlockNumber());

      await geneticAnalystsDeletedHandler.execute(geneticAnalystsDeletedCommand);

      expect(elasticsearchService.delete).toHaveBeenCalled();
      expect(elasticsearchService.deleteByQuery).not.toHaveBeenCalled();
    });


    it('should delete index Genetic Analysts and delete index qualification and service include in genetic analysts', async () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts([1], [1]);

      const geneticAnalystsDeletedCommand: GeneticAnalystsDeletedCommand = 
        new GeneticAnalystsDeletedCommand([GENETIC_ANALYSTS_PARAM], mockBlockNumber());

      await geneticAnalystsDeletedHandler.execute(geneticAnalystsDeletedCommand);

      expect(elasticsearchService.delete).toHaveBeenCalled();
      expect(elasticsearchService.deleteByQuery).toHaveBeenCalledTimes(2);
    });
  });

  describe('Genetic Analysts Updated', () => {

    it('should update index Genetic Analysts', async () => {
      const GENETIC_ANALYSTS_PARAM = createMockGeneticAnalysts([], []);

      const geneticAnalystsUpdatedCommand: GeneticAnalystsUpdatedCommand = 
        new GeneticAnalystsUpdatedCommand([GENETIC_ANALYSTS_PARAM], mockBlockNumber());

      await geneticAnalystsUpdatedHandler.execute(geneticAnalystsUpdatedCommand);

      expect(elasticsearchService.update).toHaveBeenCalled();
    });

  });
});