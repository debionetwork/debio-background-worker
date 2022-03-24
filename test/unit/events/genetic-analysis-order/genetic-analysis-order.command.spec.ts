import {
  GeneticAnalysisOrderCancelledCommand,
  GeneticAnalysisOrderCreatedCommand,
  GeneticAnalysisOrderFulfilledCommand,
  GeneticAnalysisOrderPaidCommand,
  GeneticAnalysisOrderRefundedCommand,
} from '../../../../src/substrate/events/genetic-analysis-order';
import { GeneticAnalysisOrderFailedCommand } from '../../../../src/substrate/events/genetic-analysis-order/commands/genetic-analysis-order-failed/genetic-analysis-order-failed.command';
import { BlockMetaData } from '../../../../src/substrate/models/blockMetaData';
import { GeneticAnalysisOrderModel } from '../../../../src/substrate/models/genetic-analysis-order/genetic-analysis-order.model';

jest.mock(
  '../../../../src/substrate/models/genetic-analysis-order/genetic-analysis-order.model',
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

      const _geneticAnalysisOrderCreatedCommand: GeneticAnalysisOrderCreatedCommand =
        new GeneticAnalysisOrderCreatedCommand(
          [GENETIC_ANALYSIS_ORDER_PARAM],
          mockBlockNumber(),
        ); // eslint-disable-line
      expect(GeneticAnalysisOrderModel).toHaveBeenCalled();
      expect(GeneticAnalysisOrderModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_ORDER_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalysisOrderCreatedCommand: GeneticAnalysisOrderCreatedCommand =
          new GeneticAnalysisOrderCreatedCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });

  describe('Genetic Analysis Order Cancelled Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSIS_ORDER_PARAM = createMockGeneticAnalysisOrder();

      const _geneticAnalysisOrderCancelledCommand: GeneticAnalysisOrderCancelledCommand =
        new GeneticAnalysisOrderCancelledCommand(
          [GENETIC_ANALYSIS_ORDER_PARAM],
          mockBlockNumber(),
        ); // eslint-disable-line
      expect(GeneticAnalysisOrderModel).toHaveBeenCalled();
      expect(GeneticAnalysisOrderModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_ORDER_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalysisOrderCancelledCommand: GeneticAnalysisOrderCancelledCommand =
          new GeneticAnalysisOrderCancelledCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });

  describe('Genetic Analysis Orders Failed Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSIS_ORDER_PARAM = createMockGeneticAnalysisOrder();

      const _geneticAnalysisOrderFailedCommand: GeneticAnalysisOrderFailedCommand =
        new GeneticAnalysisOrderFailedCommand(
          [GENETIC_ANALYSIS_ORDER_PARAM],
          mockBlockNumber(),
        ); // eslint-disable-line
      expect(GeneticAnalysisOrderModel).toHaveBeenCalled();
      expect(GeneticAnalysisOrderModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_ORDER_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalysisOrderFailedCommand: GeneticAnalysisOrderFailedCommand =
          new GeneticAnalysisOrderFailedCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });

  describe('Genetic Analysis Orders Fulfilled Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSIS_ORDER_PARAM = createMockGeneticAnalysisOrder();

      const _geneticAnalysisOrderFulfilledCommand: GeneticAnalysisOrderFulfilledCommand =
        new GeneticAnalysisOrderFulfilledCommand(
          [GENETIC_ANALYSIS_ORDER_PARAM],
          mockBlockNumber(),
        ); // eslint-disable-line
      expect(GeneticAnalysisOrderModel).toHaveBeenCalled();
      expect(GeneticAnalysisOrderModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_ORDER_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalysisOrderFulfilledCommand: GeneticAnalysisOrderFulfilledCommand =
          new GeneticAnalysisOrderFulfilledCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });

  describe('Genetic Analysis Orders Paid Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSIS_ORDER_PARAM = createMockGeneticAnalysisOrder();

      const _geneticAnalysisOrderPaidCommand: GeneticAnalysisOrderPaidCommand =
        new GeneticAnalysisOrderPaidCommand(
          [GENETIC_ANALYSIS_ORDER_PARAM],
          mockBlockNumber(),
        ); // eslint-disable-line
      expect(GeneticAnalysisOrderModel).toHaveBeenCalled();
      expect(GeneticAnalysisOrderModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_ORDER_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalysisOrderPaidCommand: GeneticAnalysisOrderPaidCommand =
          new GeneticAnalysisOrderPaidCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });

  describe('Genetic Analysis Orders Refunded Command', () => {
    it('should called model data and toHuman', () => {
      const GENETIC_ANALYSIS_ORDER_PARAM = createMockGeneticAnalysisOrder();

      const _geneticAnalysisOrderRefundedCommand: GeneticAnalysisOrderRefundedCommand =
        new GeneticAnalysisOrderRefundedCommand(
          [GENETIC_ANALYSIS_ORDER_PARAM],
          mockBlockNumber(),
        ); // eslint-disable-line
      expect(GeneticAnalysisOrderModel).toHaveBeenCalled();
      expect(GeneticAnalysisOrderModel).toHaveBeenCalledWith(
        GENETIC_ANALYSIS_ORDER_PARAM.toHuman(),
      );
      expect(GENETIC_ANALYSIS_ORDER_PARAM.toHuman).toHaveBeenCalled();
    });

    it('should throw error if toHuman not defined', () => {
      expect(() => {
        const _geneticAnalysisOrderRefundedCommand: GeneticAnalysisOrderRefundedCommand =
          new GeneticAnalysisOrderRefundedCommand([{}], mockBlockNumber()); // eslint-disable-line
      }).toThrowError();
    });
  });
});
