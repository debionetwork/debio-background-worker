import { CommandBus } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SubstrateService } from '../../src/substrate/substrate.handler';

export const substrateServiceProvider = {
  provide: SubstrateService,
  useFactory: () => ({
    handleEvent: jest.fn(),
    listenToEvents: jest.fn(),
    listenToNewBlock: jest.fn(),
    syncBlock: jest.fn(),
    startListen: jest.fn(),
  }),
};

export const CommandBusProvider = {
  provide: CommandBus,
  useFactory: () => ({
    execute: jest.fn(),
  }),
};

export const ElasticSearchServiceProvider = {
  provide: ElasticsearchService,
  useFactory: () => ({
    indices: {
      delete: jest.fn(),
    },
    delete: jest.fn(() => ({
      catch: jest.fn(),
    })),
    deleteByQuery: jest.fn(() => ({
      catch: jest.fn(),
    })),
    index: jest.fn(() => ({
      catch: jest.fn(),
    })),
    update: jest.fn(() => ({
      catch: jest.fn(),
    })),
    updateByQuery: jest.fn(() => ({
      catch: jest.fn(),
    })),
    search: jest.fn(),
  }),
};

export const createObjectSearchLab = (lab_id: string) => {
  return {
    index: 'labs',
    body: {
      query: {
        match: { _id: lab_id },
      },
    },
  };
};

export const createObjectSearchGeneticAnalysts = (genetic_analyst_id: string) => {
  return {
    index: 'genetic-analysts',
    body: {
      query: {
        match: { _id: genetic_analyst_id },
      },
    },
  };
};

export const createObjectSearchService = (lab_id: string) => {
  return {
    index: 'services',
    body: {
      query: {
        match: { _id: lab_id },
      },
    },
  };
};
