import { CommandBus } from "@nestjs/cqrs";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { SubstrateService } from "../../src/substrate/substrate.handler";

export const substrateServiceProvider = {
  provide: SubstrateService,
  useFactory: () => ({
    handleEvent: jest.fn(),
    listenToEvents: jest.fn(),
    listenToNewBlock: jest.fn(),
    syncBlock: jest.fn(),
    startListen: jest.fn()
  })
}

export const CommandBusProvider = {
  provide: CommandBus,
  useFactory: () => ({
    execute: jest.fn(),
  })
}

export const ElasticSearchServiceProvider = {
  provide: ElasticsearchService,
  useFactory: () => ({
    indices: {
      delete: jest.fn(),
    },
    delete: jest.fn(
      () => ({
        catch: jest.fn(),
      })
    ),
    deleteByQuery: jest.fn(
      () => ({
        catch: jest.fn(),
      })
    ),
    index: jest.fn(
      () => ({
        catch: jest.fn(),
      })
    ),
    update: jest.fn(
      () => ({
        catch: jest.fn(),
      })
    ),
    updateByQuery: jest.fn(
      () => ({
        catch: jest.fn(),
      })
    ),
    search: jest.fn(
      () => ({
        body: {
          hits: {
            hits: [
              {
                _source: {
                  info: {}
                }
              }
            ]
          }
        },
        catch: jest.fn(),
      })
    ),
  })
}