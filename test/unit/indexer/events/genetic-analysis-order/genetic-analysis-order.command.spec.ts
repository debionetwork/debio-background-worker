import {
  GeneticAnalysisOrderCancelledCommandIndexer,
  GeneticAnalysisOrderCreatedCommandIndexer,
  GeneticAnalysisOrderFulfilledCommandIndexer,
  GeneticAnalysisOrderPaidCommandIndexer,
  GeneticAnalysisOrderRefundedCommandIndexer,
} from '../../../../../src/indexer/events/genetic-analysis-order';
import { GeneticAnalysisOrderFailedCommandIndexer } from '../../../../../src/indexer/events/genetic-analysis-order/commands/genetic-analysis-order-failed/genetic-analysis-order-failed.command';
import { BlockMetaData } from '../../../../../src/indexer/models/block-meta-data';
import { GeneticAnalysisOrderModel } from '../../../../../src/indexer/models/genetic-analysis-order/genetic-analysis-order.model';

jest.mock(
  '../../../../../src/indexer/models/genetic-analysis-order/genetic-analysis-order.model',
);

describe('Orders Substrate Event Handler', () => {
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

  describe('Genetic Analysis Orders Created Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSIS_ORDER_PARAM = createMockGeneticAnalysisOrder();

      /* eslint-disable */
      const _geneticAnalysisOrderCreatedCommand: GeneticAnalysisOrderCreatedCommandIndexer =
        new GeneticAnalysisOrderCreatedCommandIndexer(
          [GENETIC_ANALYSIS_ORDER_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalysisOrderModel).toHaveBeenCalled();
      expect(GeneticAnalysisOrderModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_ORDER_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalysisOrderCreatedCommand: GeneticAnalysisOrderCreatedCommandIndexer =
          new GeneticAnalysisOrderCreatedCommandIndexer(
            [{}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysis Order Cancelled Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSIS_ORDER_PARAM = createMockGeneticAnalysisOrder();

      /* eslint-disable */
      const _geneticAnalysisOrderCancelledCommand: GeneticAnalysisOrderCancelledCommandIndexer =
        new GeneticAnalysisOrderCancelledCommandIndexer(
          [GENETIC_ANALYSIS_ORDER_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalysisOrderModel).toHaveBeenCalled();
      expect(GeneticAnalysisOrderModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_ORDER_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalysisOrderCancelledCommand: GeneticAnalysisOrderCancelledCommandIndexer =
          new GeneticAnalysisOrderCancelledCommandIndexer(
            [{}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysis Orders Failed Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSIS_ORDER_PARAM = createMockGeneticAnalysisOrder();

      /* eslint-disable */
      const _geneticAnalysisOrderFailedCommand: GeneticAnalysisOrderFailedCommandIndexer =
        new GeneticAnalysisOrderFailedCommandIndexer(
          [GENETIC_ANALYSIS_ORDER_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalysisOrderModel).toHaveBeenCalled();
      expect(GeneticAnalysisOrderModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_ORDER_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalysisOrderFailedCommand: GeneticAnalysisOrderFailedCommandIndexer =
          new GeneticAnalysisOrderFailedCommandIndexer([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysis Orders Fulfilled Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSIS_ORDER_PARAM = createMockGeneticAnalysisOrder();

      /* eslint-disable */
      const _geneticAnalysisOrderFulfilledCommand: GeneticAnalysisOrderFulfilledCommandIndexer =
        new GeneticAnalysisOrderFulfilledCommandIndexer(
          [GENETIC_ANALYSIS_ORDER_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalysisOrderModel).toHaveBeenCalled();
      expect(GeneticAnalysisOrderModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_ORDER_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalysisOrderFulfilledCommand: GeneticAnalysisOrderFulfilledCommandIndexer =
          new GeneticAnalysisOrderFulfilledCommandIndexer(
            [{}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysis Orders Paid Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSIS_ORDER_PARAM = createMockGeneticAnalysisOrder();

      /* eslint-disable */
      const _geneticAnalysisOrderPaidCommand: GeneticAnalysisOrderPaidCommandIndexer =
        new GeneticAnalysisOrderPaidCommandIndexer(
          [GENETIC_ANALYSIS_ORDER_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalysisOrderModel).toHaveBeenCalled();
      expect(GeneticAnalysisOrderModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_ORDER_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalysisOrderPaidCommand: GeneticAnalysisOrderPaidCommandIndexer =
          new GeneticAnalysisOrderPaidCommandIndexer([{}], mockBlockNumber());
        /* eslint-enable */
      }).toThrowError();
    });
  });

  describe('Genetic Analysis Orders Refunded Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSIS_ORDER_PARAM = createMockGeneticAnalysisOrder();

      /* eslint-disable */
      const _geneticAnalysisOrderRefundedCommand: GeneticAnalysisOrderRefundedCommandIndexer =
        new GeneticAnalysisOrderRefundedCommandIndexer(
          [GENETIC_ANALYSIS_ORDER_PARAM],
          mockBlockNumber(),
        );
      /* eslint-enable */
      expect(GeneticAnalysisOrderModel).toHaveBeenCalled();
      expect(GeneticAnalysisOrderModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_ORDER_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        /* eslint-disable */
        const _geneticAnalysisOrderRefundedCommand: GeneticAnalysisOrderRefundedCommandIndexer =
          new GeneticAnalysisOrderRefundedCommandIndexer(
            [{}],
            mockBlockNumber(),
          );
        /* eslint-enable */
      }).toThrowError();
    });
  });
});
