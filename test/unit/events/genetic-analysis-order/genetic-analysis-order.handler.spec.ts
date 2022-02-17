import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import {
  GeneticAnalysisOrderCancelledCommand,
  GeneticAnalysisOrderCommandHandlers,
  GeneticAnalysisOrderCreatedCommand,
  GeneticAnalysisOrderFailedCommand,
  GeneticAnalysisOrderFulfilledCommand,
  GeneticAnalysisOrderPaidCommand,
  GeneticAnalysisOrderRefundedCommand,
} from '../../../../src/substrate/events/genetic-analysis-order';
import { createObjectSearchGeneticAnalysts, createObjectSearchGeneticAnalystsService, ElasticSearchServiceProvider } from '../../mock';
import { GeneticAnalysisOrderCancelledHandler } from '../../../../src/substrate/events/genetic-analysis-order/commands/genetic-analysis-order-cancelled/genetic-analysis-order-cancelled.handler';
import { GeneticAnalysisOrderCreatedHandler } from '../../../../src/substrate/events/genetic-analysis-order/commands/genetic-analysis-order-created/genetic-analysis-order-created.handler';
import { GeneticAnalysisOrderFailedHandler } from '../../../../src/substrate/events/genetic-analysis-order/commands/genetic-analysis-order-failed/genetic-analysis-order-failed.handler';
import { GeneticAnalysisOrderFulfilledHandler } from '../../../../src/substrate/events/genetic-analysis-order/commands/genetic-analysis-order-fulfilled/genetic-analysis-order-fulfilled.handler';
import { GeneticAnalysisOrderPaidHandler } from '../../../../src/substrate/events/genetic-analysis-order/commands/genetic-analysis-order-paid/genetic-analysis-order-paid.handler';
import { GeneticAnalysisOrderRefundedHandler } from '../../../../src/substrate/events/genetic-analysis-order/commands/genetic-analysis-order-refunded/genetic-analysis-order-refunded.handler';
import { BlockMetaData } from '../../../../src/substrate/models/blockMetaData';
import { when } from 'jest-when';

describe('Genetic Analysis Order Substrate Event Handler', () => {
  let elasticsearchService: ElasticsearchService;

  let geneticAnalysisOrderCancelledHandler: GeneticAnalysisOrderCancelledHandler;
  let geneticAnalysisOrderCreatedHandler: GeneticAnalysisOrderCreatedHandler;
  let geneticAnalysisOrderFailedHandler: GeneticAnalysisOrderFailedHandler;
  let geneticAnalysisOrderFulfilledHandler: GeneticAnalysisOrderFulfilledHandler;
  let geneticAnalysisOrderPaidHandler: GeneticAnalysisOrderPaidHandler;
  let geneticAnalysisOrderRefundedHandler: GeneticAnalysisOrderRefundedHandler;

  function createMockGeneticAnalysisOrder() {
    const first_price = {
      component: 'string',
      value: 1,
    };
    const second_price = {
      component: 'string',
      value: 1,
    };

    return {
      toHuman: jest.fn(() => ({
        id: 'string',
        serviceId: 'string',
        customerId: 'string',
        customerBoxPublicKey: 'string',
        sellerId: 'string',
        geneticDataId: 'string',
        geneticAnalysisTrackingId: 'string',
        currency: 'string',
        prices: [first_price],
        additionalPrices: [second_price],
        status: 'string',
        createdAt: '1',
        updatedAt: '1',
      })),
    };
  }

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: 'string',
      blockNumber: 1,
    };
  }

  beforeEach(async () => {
    const modules: TestingModule = await Test.createTestingModule({
      providers: [
        ElasticSearchServiceProvider,
        ...GeneticAnalysisOrderCommandHandlers,
      ],
    }).compile();

    elasticsearchService = modules.get(ElasticsearchService);

    geneticAnalysisOrderCancelledHandler = modules.get(
      GeneticAnalysisOrderCancelledHandler,
    );
    geneticAnalysisOrderCreatedHandler = modules.get(
      GeneticAnalysisOrderCreatedHandler,
    );
    geneticAnalysisOrderFailedHandler = modules.get(
      GeneticAnalysisOrderFailedHandler,
    );
    geneticAnalysisOrderFulfilledHandler = modules.get(
      GeneticAnalysisOrderFulfilledHandler,
    );
    geneticAnalysisOrderPaidHandler = modules.get(
      GeneticAnalysisOrderPaidHandler,
    );
    geneticAnalysisOrderRefundedHandler = modules.get(
      GeneticAnalysisOrderRefundedHandler,
    );

    await modules.init();
  });

  describe('Genetic Analysis Order Cancelled Handler', () => {
    it('should update genetic analysis order status to cancelled', async () => {
      const GENETIC_ANALYSIS_ORDER_PARAM = createMockGeneticAnalysisOrder();

      const geneticAnalysisOrderCancelledCommand: GeneticAnalysisOrderCancelledCommand =
        new GeneticAnalysisOrderCancelledCommand(
          [GENETIC_ANALYSIS_ORDER_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalysisOrderCancelledHandler.execute(
        geneticAnalysisOrderCancelledCommand,
      );

      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysis Order Created Handler', () => {
    it('should create index genetic analysis order', async () => {
      const GENETIC_ANALYSIS_ORDER_PARAM = createMockGeneticAnalysisOrder();

      const geneticAnalysisOrderCreatedCommand: GeneticAnalysisOrderCreatedCommand =
        new GeneticAnalysisOrderCreatedCommand(
          [GENETIC_ANALYSIS_ORDER_PARAM],
          mockBlockNumber(),
        );
        
      const SERVICE_ID = 'string';
      const GA_ID = 'string';

      const GENETIC_ANALYST_SERVICE_CALLED_WITH = createObjectSearchGeneticAnalystsService(SERVICE_ID);
      const GENETIC_ANALYST_SERVICE_ES_RESULT = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  info: {},
                },
              },
            ],
          },
        },
      };

      const GENETIC_ANALYST_CALLED_WITH = createObjectSearchGeneticAnalysts(GA_ID);
      const GENETIC_ANALYST_ES_RESULT = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  info: {},
                },
              },
            ],
          },
        },
      };

      when(elasticsearchService.search)
        .calledWith(GENETIC_ANALYST_SERVICE_CALLED_WITH)
        .mockReturnValue(GENETIC_ANALYST_SERVICE_ES_RESULT);

      when(elasticsearchService.search)
        .calledWith(GENETIC_ANALYST_CALLED_WITH)
        .mockReturnValue(GENETIC_ANALYST_ES_RESULT);

      await geneticAnalysisOrderCreatedHandler.execute(
        geneticAnalysisOrderCreatedCommand,
      );

      expect(elasticsearchService.search).toHaveBeenCalledTimes(2);
      expect(elasticsearchService.index).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysis Order Failed Handler', () => {
    it('should update genetic analysis order status to failed', async () => {
      const GENETIC_ANALYSIS_ORDER_PARAM = createMockGeneticAnalysisOrder();

      const geneticAnalysisOrderFailedCommand: GeneticAnalysisOrderFailedCommand =
        new GeneticAnalysisOrderFailedCommand(
          [GENETIC_ANALYSIS_ORDER_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalysisOrderFailedHandler.execute(
        geneticAnalysisOrderFailedCommand,
      );

      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysis Order Fulfilled Handler', () => {
    it('should update genetic analysis order status fulfilled', async () => {
      const GENETIC_ANALYSIS_ORDER_PARAM = createMockGeneticAnalysisOrder();

      const geneticAnalysisOrderFulfilledCommand: GeneticAnalysisOrderFulfilledCommand =
        new GeneticAnalysisOrderFulfilledCommand(
          [GENETIC_ANALYSIS_ORDER_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalysisOrderFulfilledHandler.execute(
        geneticAnalysisOrderFulfilledCommand,
      );

      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysis Order Paid Handler', () => {
    it('should update genetic analysis order status paid', async () => {
      const GENETIC_ANALYSIS_ORDER_PARAM = createMockGeneticAnalysisOrder();

      const geneticAnalysisOrderPaidCommand: GeneticAnalysisOrderPaidCommand =
        new GeneticAnalysisOrderPaidCommand(
          [GENETIC_ANALYSIS_ORDER_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalysisOrderPaidHandler.execute(
        geneticAnalysisOrderPaidCommand,
      );

      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });

  describe('Genetic Analysis Order Refunded Handler', () => {
    it('should update genetic analysis order status refunded', async () => {
      const GENETIC_ANALYSIS_ORDER_PARAM = createMockGeneticAnalysisOrder();

      const geneticAnalysisOrderRefundedCommand: GeneticAnalysisOrderRefundedCommand =
        new GeneticAnalysisOrderRefundedCommand(
          [GENETIC_ANALYSIS_ORDER_PARAM],
          mockBlockNumber(),
        );

      await geneticAnalysisOrderRefundedHandler.execute(
        geneticAnalysisOrderRefundedCommand,
      );

      expect(elasticsearchService.update).toHaveBeenCalled();
    });
  });
});
