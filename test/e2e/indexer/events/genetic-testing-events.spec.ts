import { INestApplication } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiPromise } from '@polkadot/api';
import { GeneticTestingCommandHandlers } from '@indexer/events/genetic-testing';
import { IndexerHandler } from '@indexer/indexer.handler';
import { CommonModule, ProcessEnvModule } from '@common/index';
import { IndexerModule } from '@indexer/indexer.module';
import { initializeApi } from '../../polkadot-init';
import {
  createOrder,
  createService,
  DnaSampleStatus,
  Lab,
  Order,
  OrderStatus,
  processDnaSample,
  queryLabById,
  queryOrdersByCustomer,
  queryServiceById,
  queryStakedDataByAccountId,
  queryStakedDataByOrderId,
  Service,
  setOrderPaid,
  submitDataBountyDetails,
  submitTestResult,
  updateLabVerificationStatus,
} from '@debionetwork/polkadot-provider';
import { labDataMock } from '../../../mock/models/labs/labs.mock';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';
import { serviceDataMock } from '../../../mock/models/labs/services.mock';

describe('Indexer Genetic Testing Event', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
  let elasticsearchService: ElasticsearchService;
  let lab: Lab;
  let service: Service;
  let order: Order;

  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CommonModule,
        ProcessEnvModule,
        CqrsModule,
        ScheduleModule.forRoot(),
        IndexerModule,
      ],
      providers: [IndexerHandler, ...GeneticTestingCommandHandlers],
    }).compile();

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

  it('should register lab', async () => {
    const { info: labInfo } = labDataMock;

    // eslint-disable-next-line
    const verifiedLab: Promise<Lab> = new Promise((resolve, reject) => {
      updateLabVerificationStatus(
        api,
        pair,
        pair.address,
        VerificationStatus.Verified,
        () => {
          queryLabById(api, pair.address).then((res) => {
            resolve(res);
          });
        },
      );
    });

    lab = await verifiedLab;

    expect(lab.info).toEqual(labInfo);
    expect(lab.verificationStatus).toEqual(VerificationStatus.Verified);
  }, 80000);

  it('should create service', async () => {
    const { info: serviceInfo, serviceFlow } = serviceDataMock;
    // eslint-disable-next-line
    const servicePromise: Promise<Service> = new Promise((resolve, reject) => {
      createService(api, pair, serviceInfo, serviceFlow, () => {
        queryLabById(api, pair.address).then((lab) => {
          queryServiceById(api, lab.services.at(-1)).then((res) => {
            resolve(res);
          });
        });
      });
    });

    service = await servicePromise;

    expect(service.info).toEqual(serviceInfo);
    expect(service.serviceFlow).toEqual(serviceFlow);
  }, 80000);

  it('should create order', async () => {
    const createOrderPromise: Promise<Order> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        createOrder(
          api,
          pair,
          service.id,
          0,
          lab.info.boxPublicKey,
          serviceDataMock.serviceFlow,
          () => {
            queryOrdersByCustomer(api, pair.address).then((res) => {
              resolve(res.at(-1));
            });
          },
        );
      },
    );

    order = (await createOrderPromise).normalize();

    expect(order.serviceId).toEqual(service.id);
    expect(order.sellerId).toEqual(lab.accountId);
    expect(order.status).toEqual(OrderStatus.Unpaid);

    // eslint-disable-next-line
    const paidOrderPromise: Promise<Order> = new Promise((resolve, reject) => {
      setOrderPaid(api, pair, order.id, () => {
        queryOrdersByCustomer(api, pair.address).then((res) => {
          resolve(res.at(-1));
        });
      });
    });

    order = (await paidOrderPromise).normalize();

    expect(order.serviceId).toEqual(service.id);
    expect(order.sellerId).toEqual(lab.accountId);
    expect(order.status).toEqual(OrderStatus.Paid);
  }, 80000);

  it('should listen data staked', async () => {
    const submitDataBountyDetailsPromise: Promise<string[]> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
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
                submitDataBountyDetails(api, pair, order.id, order.id, () => {
                  // Order ID as data hash on param 1
                  queryStakedDataByAccountId(api, pair.address).then((res) => {
                    resolve(res);
                  });
                });
              },
            );
          },
        );
      },
    );

    const stakedData = await submitDataBountyDetailsPromise;
    const stakedDataByOrderId = await queryStakedDataByOrderId(api, order.id);

    expect(order.serviceId).toEqual(service.id);
    expect(order.sellerId).toEqual(lab.accountId);
    expect(stakedData).toEqual(order.id);
    expect(stakedDataByOrderId).toEqual(order.id);

    const esOrder = await elasticsearchService.search({
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

    expect(esOrder.body.hits.hits.length).toEqual(1);
    const orderData = esOrder.body.hits.hits[0]._source;

    expect(orderData['id']).toEqual(order.id);
    expect(orderData['service_id']).toEqual(service.id);
    expect(orderData['seller_id']).toEqual(lab.accountId);

    const esDataStaked = await elasticsearchService.search({
      index: 'data-bounty',
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

    expect(esDataStaked.body.hits.hits.length).toEqual(1);
    const dataStaked = esDataStaked.body.hits.hits[0]._source;

    expect(dataStaked['order_id']).toEqual(order.id);
    expect(dataStaked['hash_data_bounty']).toEqual(stakedData);
  }, 180000);
});
