import { INestApplication } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiPromise } from '@polkadot/api';
import { initializeApi } from '../../polkadot-init';
import { CommonModule, ProcessEnvModule } from '@common/index';
import { IndexerHandler } from '@indexer/indexer.handler';
import { IndexerModule } from '@indexer/indexer.module';
import {
  cancelOrder,
  createOrder,
  DnaSampleStatus,
  fulfillOrder,
  Order,
  OrderStatus,
  processDnaSample,
  queryDnaSamples,
  queryLabById,
  queryOrderDetailByOrderID,
  queryOrdersByCustomer,
  rejectDnaSample,
  ServiceFlow,
  setOrderPaid,
  setOrderRefunded,
  submitTestResult,
} from '@debionetwork/polkadot-provider';
import { OrderCommandHandlers } from '@indexer/events/orders';
import { DnaSample } from '@debionetwork/polkadot-provider/lib/models/labs/genetic-testing/dna-sample';
import { SecretKeyList } from '@common/secrets';

describe('Orders Events', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
  let order: Order;
  let elasticsearchService: ElasticsearchService;

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
        CommonModule,
        ProcessEnvModule,
        CqrsModule,
        ScheduleModule.forRoot(),
        IndexerModule,
      ],
      providers: [IndexerHandler, ...OrderCommandHandlers],
    })
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

  it('create order event', async () => {
    const createOrderPromise: Promise<Order> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        queryLabById(api, pair.address).then((lab) => {
          createOrder(
            api,
            pair,
            lab.services.at(-1),
            0,
            '0x8d2f0702072c07d31251be881104acde7953ecc1c8b33c31fce59ec6b0799ecc',
            ServiceFlow.RequestTest,
            () => {
              queryOrdersByCustomer(api, pair.address).then((res) => {
                resolve(res.at(-1));
              });
            },
          );
        });
      },
    );

    order = await createOrderPromise;

    expect(order.sellerId).toEqual(pair.address);
    expect(order.customerId).toEqual(pair.address);
    expect(order.orderFlow).toEqual(ServiceFlow.RequestTest);
    expect(order.status).toEqual(OrderStatus.Unpaid);

    const labEs = await elasticsearchService.search({
      index: 'labs',
      body: {
        query: {
          match: { _id: order.sellerId.toString() },
        },
      },
    });

    expect(labEs.body.hits.hits.length).toEqual(1);
    expect(labEs.body.hits.hits[0]._id).toEqual(order.sellerId);

    const lab_info = labEs.body.hits.hits[0]._source.info;

    const serviceEs = await elasticsearchService.search({
      index: 'services',
      body: {
        query: {
          match: { _id: order.serviceId.toString() },
        },
      },
    });

    expect(serviceEs.body.hits.hits.length).toEqual(1);
    expect(labEs.body.hits.hits[0]._id).toEqual(order.sellerId);

    const service_info = serviceEs.body.hits.hits[0]._source.info;

    const esOrders = await elasticsearchService.search({
      index: 'orders',
      body: {
        query: {
          match: {
            _id: {
              query: order.id,
            },
          },
        },
      },
    });

    expect(esOrders.body.hits.hits.length).toEqual(1);

    const orderSource = esOrders.body.hits.hits[0]._source;

    expect(orderSource['service_id']).toEqual(order.serviceId);
    expect(orderSource['customer_id']).toEqual(order.customerId);
    expect(orderSource['customer_box_public_key']).toEqual(
      order.customerBoxPublicKey,
    );
    expect(orderSource['seller_id']).toEqual(order.sellerId);
    expect(orderSource['order_flow']).toEqual(ServiceFlow.RequestTest);
    expect(orderSource['status']).toEqual(OrderStatus.Unpaid);
    expect(orderSource['lab_info']).toEqual(lab_info);
    expect(orderSource['service_info']).toEqual(service_info);
  }, 120000);

  it('paid order event', async () => {
    // eslint-disable-next-line
    const paidOrderPromise: Promise<Order> = new Promise((resolve, reject) => {
      setOrderPaid(api, pair, order.id, () => {
        queryOrdersByCustomer(api, pair.address).then((res) => {
          resolve(res.at(-1));
        });
      });
    });

    order = await paidOrderPromise;

    expect(order.sellerId).toEqual(pair.address);
    expect(order.customerId).toEqual(pair.address);
    expect(order.orderFlow).toEqual(ServiceFlow.RequestTest);
    expect(order.status).toEqual(OrderStatus.Paid);

    const esOrders = await elasticsearchService.search({
      index: 'orders',
      body: {
        query: {
          match: {
            _id: {
              query: order.id,
            },
          },
        },
      },
    });

    expect(esOrders.body.hits.hits.length).toEqual(1);

    const orderSource = esOrders.body.hits.hits[0]._source;

    expect(orderSource['service_id']).toEqual(order.serviceId);
    expect(orderSource['customer_id']).toEqual(order.customerId);
    expect(orderSource['customer_box_public_key']).toEqual(
      order.customerBoxPublicKey,
    );
    expect(orderSource['seller_id']).toEqual(order.sellerId);
    expect(orderSource['order_flow']).toEqual(ServiceFlow.RequestTest);
    expect(orderSource['status']).toEqual(OrderStatus.Paid);
  }, 120000);

  it('fulfilled order event', async () => {
    // eslint-disable-next-line
    const paidOrderPromise: Promise<Order> = new Promise((resolve, reject) => {
      submitTestResult(
        api,
        pair,
        order.dnaSampleTrackingId,
        {
          comments: 'comment',
          resultLink: 'resultLink',
          reportLink: 'reportLink',
        },
        () => {
          processDnaSample(
            api,
            pair,
            order.dnaSampleTrackingId,
            DnaSampleStatus.ResultReady,
            () => {
              fulfillOrder(api, pair, order.id, () => {
                queryOrdersByCustomer(api, pair.address).then((res) => {
                  resolve(res.at(-1));
                });
              });
            },
          );
        },
      );
    });

    order = await paidOrderPromise;

    expect(order.sellerId).toEqual(pair.address);
    expect(order.customerId).toEqual(pair.address);
    expect(order.orderFlow).toEqual(ServiceFlow.RequestTest);
    expect(order.status).toEqual(OrderStatus.Fulfilled);

    const esOrders = await elasticsearchService.search({
      index: 'orders',
      body: {
        query: {
          match: {
            _id: {
              query: order.id,
            },
          },
        },
      },
    });

    expect(esOrders.body.hits.hits.length).toEqual(1);

    const orderSource = esOrders.body.hits.hits[0]._source;

    expect(orderSource['service_id']).toEqual(order.serviceId);
    expect(orderSource['customer_id']).toEqual(order.customerId);
    expect(orderSource['customer_box_public_key']).toEqual(
      order.customerBoxPublicKey,
    );
    expect(orderSource['seller_id']).toEqual(order.sellerId);
    expect(orderSource['order_flow']).toEqual(ServiceFlow.RequestTest);
    expect(orderSource['status']).toEqual(OrderStatus.Fulfilled);
  }, 120000);

  it('cancel order event', async () => {
    const createOrderPromise: Promise<Order> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        queryLabById(api, pair.address).then((lab) => {
          createOrder(
            api,
            pair,
            lab.services.at(-1),
            0,
            '0x8d2f0702072c07d31251be881104acde7953ecc1c8b33c31fce59ec6b0799ecc',
            ServiceFlow.RequestTest,
            () => {
              queryOrdersByCustomer(api, pair.address).then((res) => {
                resolve(res.at(-1));
              });
            },
          );
        });
      },
    );

    order = await createOrderPromise;

    expect(order.sellerId).toEqual(pair.address);
    expect(order.customerId).toEqual(pair.address);
    expect(order.orderFlow).toEqual(ServiceFlow.RequestTest);
    expect(order.status).toEqual(OrderStatus.Unpaid);

    const labEs = await elasticsearchService.search({
      index: 'labs',
      body: {
        query: {
          match: { _id: order.sellerId.toString() },
        },
      },
    });

    expect(labEs.body.hits.hits.length).toEqual(1);

    const lab_info = labEs.body.hits.hits[0]._source.info;

    const serviceEs = await elasticsearchService.search({
      index: 'services',
      body: {
        query: {
          match: { _id: order.serviceId.toString() },
        },
      },
    });

    expect(serviceEs.body.hits.hits.length).toEqual(1);

    const service_info = serviceEs.body.hits.hits[0]._source.info;

    const cancelOrderPromise: Promise<Order> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        cancelOrder(api, pair, order.id, () => {
          queryOrdersByCustomer(api, pair.address).then((res) => {
            resolve(res.at(-1));
          });
        });
      },
    );

    order = await cancelOrderPromise;

    expect(order.sellerId).toEqual(pair.address);
    expect(order.customerId).toEqual(pair.address);
    expect(order.orderFlow).toEqual(ServiceFlow.RequestTest);
    expect(order.status).toEqual(OrderStatus.Cancelled);

    const esOrders = await elasticsearchService.search({
      index: 'orders',
      body: {
        query: {
          match: {
            _id: {
              query: order.id,
            },
          },
        },
      },
    });

    expect(esOrders.body.hits.hits.length).toEqual(1);

    const orderSource = esOrders.body.hits.hits[0]._source;

    expect(orderSource['service_id']).toEqual(order.serviceId);
    expect(orderSource['customer_id']).toEqual(order.customerId);
    expect(orderSource['customer_box_public_key']).toEqual(
      order.customerBoxPublicKey,
    );
    expect(orderSource['seller_id']).toEqual(order.sellerId);
    expect(orderSource['order_flow']).toEqual(ServiceFlow.RequestTest);
    expect(orderSource['status']).toEqual(OrderStatus.Cancelled);
    expect(orderSource['lab_info']).toEqual(lab_info);
    expect(orderSource['service_info']).toEqual(service_info);
  }, 120000);

  it('failed order event', async () => {
    const createOrderPromise: Promise<Order> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        queryLabById(api, pair.address).then((lab) => {
          createOrder(
            api,
            pair,
            lab.services.at(-1),
            0,
            '0x8d2f0702072c07d31251be881104acde7953ecc1c8b33c31fce59ec6b0799ecc',
            ServiceFlow.RequestTest,
            () => {
              queryOrdersByCustomer(api, pair.address).then((res) => {
                resolve(res.at(-1));
              });
            },
          );
        });
      },
    );

    order = await createOrderPromise;

    expect(order.sellerId).toEqual(pair.address);
    expect(order.customerId).toEqual(pair.address);
    expect(order.orderFlow).toEqual(ServiceFlow.RequestTest);
    expect(order.status).toEqual(OrderStatus.Unpaid);

    // eslint-disable-next-line
    const paidOrderPromise: Promise<Order> = new Promise((resolve, reject) => {
      setOrderPaid(api, pair, order.id, () => {
        queryOrdersByCustomer(api, pair.address).then((res) => {
          resolve(res.at(-1));
        });
      });
    });

    order = await paidOrderPromise;

    expect(order.sellerId).toEqual(pair.address);
    expect(order.customerId).toEqual(pair.address);
    expect(order.orderFlow).toEqual(ServiceFlow.RequestTest);
    expect(order.status).toEqual(OrderStatus.Paid);

    const labEs = await elasticsearchService.search({
      index: 'labs',
      body: {
        query: {
          match: { _id: order.sellerId.toString() },
        },
      },
    });

    expect(labEs.body.hits.hits.length).toEqual(1);

    const lab_info = labEs.body.hits.hits[0]._source.info;

    const serviceEs = await elasticsearchService.search({
      index: 'services',
      body: {
        query: {
          match: { _id: order.serviceId.toString() },
        },
      },
    });

    expect(serviceEs.body.hits.hits.length).toEqual(1);

    const service_info = serviceEs.body.hits.hits[0]._source.info;

    await submitTestResult(api, pair, order.dnaSampleTrackingId, {
      comments: 'comment',
      resultLink: 'resultLink',
      reportLink: 'reportLink',
    });

    await processDnaSample(
      api,
      pair,
      order.dnaSampleTrackingId,
      DnaSampleStatus.Rejected,
    );
    const rejectedTitle = 'REJECTED';
    const rejectedDescription = 'REJECTED_DESCRIPTION';

    const rejectDnaSamplePromise: Promise<DnaSample> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        rejectDnaSample(
          api,
          pair,
          order.dnaSampleTrackingId,
          rejectedTitle,
          rejectedDescription,
          () => {
            queryDnaSamples(api, order.dnaSampleTrackingId).then((res) => {
              resolve(res);
            });
          },
        );
      },
    );

    const dnaSample = await rejectDnaSamplePromise;
    expect(dnaSample.labId).toEqual(order.sellerId);
    expect(dnaSample.ownerId).toEqual(order.customerId);
    expect(dnaSample.trackingId).toEqual(order.dnaSampleTrackingId);
    expect(dnaSample.status).toEqual(DnaSampleStatus.Rejected);
    expect(dnaSample.rejectedTitle).toEqual(rejectedTitle);
    expect(dnaSample.rejectedDescription).toEqual(rejectedDescription);

    order = await queryOrderDetailByOrderID(api, order.id);

    expect(order.status).toEqual(OrderStatus.Failed);

    const esOrders = await elasticsearchService.search({
      index: 'orders',
      body: {
        query: {
          match: {
            _id: {
              query: order.id,
            },
          },
        },
      },
    });

    expect(esOrders.body.hits.hits.length).toEqual(1);

    const orderSource = esOrders.body.hits.hits[0]._source;

    expect(orderSource['service_id']).toEqual(order.serviceId);
    expect(orderSource['customer_id']).toEqual(order.customerId);
    expect(orderSource['customer_box_public_key']).toEqual(
      order.customerBoxPublicKey,
    );
    expect(orderSource['seller_id']).toEqual(order.sellerId);
    expect(orderSource['order_flow']).toEqual(ServiceFlow.RequestTest);
    expect(orderSource['lab_info']).toEqual(lab_info);
    expect(orderSource['service_info']).toEqual(service_info);
  }, 120000);

  it('refunded order event', async () => {
    const refundedOrderPromise: Promise<Order> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        setOrderRefunded(api, pair, order.id, () => {
          queryOrdersByCustomer(api, pair.address).then((res) => {
            resolve(res.at(-1));
          });
        });
      },
    );

    order = await refundedOrderPromise;

    expect(order.sellerId).toEqual(pair.address);
    expect(order.customerId).toEqual(pair.address);
    expect(order.orderFlow).toEqual(ServiceFlow.RequestTest);
    expect(order.status).toEqual(OrderStatus.Refunded);

    const esOrders = await elasticsearchService.search({
      index: 'orders',
      body: {
        query: {
          match: {
            _id: {
              query: order.id,
            },
          },
        },
      },
    });

    expect(esOrders.body.hits.hits.length).toEqual(1);

    const orderSource = esOrders.body.hits.hits[0]._source;

    expect(orderSource['service_id']).toEqual(order.serviceId);
    expect(orderSource['customer_id']).toEqual(order.customerId);
    expect(orderSource['customer_box_public_key']).toEqual(
      order.customerBoxPublicKey,
    );
    expect(orderSource['seller_id']).toEqual(order.sellerId);
    expect(orderSource['order_flow']).toEqual(ServiceFlow.RequestTest);
    expect(orderSource['status']).toEqual(OrderStatus.Refunded);
  }, 120000);
});
