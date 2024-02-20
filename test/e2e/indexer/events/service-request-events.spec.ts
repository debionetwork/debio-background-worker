import { Test, TestingModule } from '@nestjs/testing';
import { IndexerHandler } from '@indexer/indexer.handler';
import { CommonModule } from '@common/common.module';
import { ProcessEnvModule } from '@common/proxies/process-env/process-env.module';
import { ServiceCommandHandlers } from '@indexer/events/services';
import { INestApplication } from '@nestjs/common';
import { initializeApi } from '../../polkadot-init';
import { ApiPromise } from '@polkadot/api';
import {
  claimRequest,
  createRequest,
  createService,
  deleteService,
  deregisterLab,
  Lab,
  queryLabById,
  queryLabCount,
  queryServiceRequestByAccountId,
  queryServiceRequestById,
  queryServicesByMultipleIds,
  registerLab,
  RequestStatus,
  Service,
  ServiceRequest,
  updateLabVerificationStatus,
} from '@debionetwork/polkadot-provider';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CqrsModule } from '@nestjs/cqrs';
import { labDataMock } from '../../../mock/models/labs/labs.mock';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';
import { serviceDataMock } from '../../../mock/models/labs/services.mock';
import { LabCommandHandlers } from '@indexer/events/labs';
import { RequestServiceCommandHandlers } from '@indexer/events/service-request';
import { ScheduleModule } from '@nestjs/schedule';
import { IndexerModule } from '@indexer/indexer.module';
import { serviceRequestMock } from '../../../mock/models/service-request/service-request.mock';

describe('Event Command Service Request Claimed', () => {
  let app: INestApplication;

  let api: ApiPromise;
  let pair: any;
  let serviceRequest: ServiceRequest;
  let lab: Lab;
  let service: Service;
  let elasticsearchService: ElasticsearchService;

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
      providers: [
        IndexerHandler,
        ...LabCommandHandlers,
        ...ServiceCommandHandlers,
        ...RequestServiceCommandHandlers,
      ],
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

  it('create service request', async () => {
    const createServicePromise: Promise<ServiceRequest> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        createRequest(
          api,
          pair,
          serviceRequestMock.country,
          serviceRequestMock.region,
          serviceRequestMock.city,
          serviceRequestMock.serviceCategory,
          serviceRequestMock.stakingAmount,
          () => {
            queryServiceRequestByAccountId(api, pair.address).then((res) => {
              resolve(res.at(-1));
            });
          },
        );
      },
    );

    serviceRequest = (await createServicePromise).normalize();

    expect(serviceRequest.city).toEqual(serviceRequestMock.city);
    expect(serviceRequest.region).toEqual(serviceRequestMock.region);
    expect(serviceRequest.country).toEqual(serviceRequestMock.country);
    expect(serviceRequest.serviceCategory).toEqual(
      serviceRequestMock.serviceCategory,
    );
    expect(serviceRequest.status).toEqual(RequestStatus.Open);
    expect(serviceRequest.requesterAddress).toEqual(pair.address);

    const serviceRequestES = await elasticsearchService.search({
      index: 'create-service-request',
      body: {
        query: {
          match: {
            _id: {
              query: serviceRequest.hash,
            },
          },
        },
      },
    });

    expect(serviceRequestES.body.hits.hits.length).toEqual(1);
    const serviceRequestSource = serviceRequestES.body.hits.hits[0]._source;

    expect(serviceRequestSource['request']['hash']).toEqual(
      serviceRequest.hash,
    );
    expect(serviceRequestSource['request']['requester_address']).toEqual(
      serviceRequest.requesterAddress,
    );
    expect(serviceRequestSource['request']['country']).toEqual(
      serviceRequest.country,
    );
    expect(serviceRequestSource['request']['city']).toEqual(
      serviceRequest.city,
    );
    expect(serviceRequestSource['request']['region']).toEqual(
      serviceRequest.region,
    );
    expect(serviceRequestSource['request']['service_category']).toEqual(
      serviceRequest.serviceCategory,
    );
    expect(serviceRequestSource['request']['status']).toEqual(
      RequestStatus.Open,
    );

    const regionServiceRequest = await elasticsearchService.search({
      index: 'country-service-request',
      body: {
        query: {
          match: {
            _id: {
              query: serviceRequest.country,
            },
          },
        },
      },
    });

    expect(regionServiceRequest.body.hits.hits.length).toEqual(1);
    const dataRegionServiceRequest =
      regionServiceRequest.body.hits.hits[0]._source;
    expect(dataRegionServiceRequest['service_request']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          amount: '1,000,000,000,000,000,000',
          category: serviceRequest.serviceCategory,
          city: serviceRequest.city,
          region: serviceRequest.region,
          requester: serviceRequest.requesterAddress,
          id: serviceRequest.hash,
        }),
      ]),
    );
  }, 80000);

  it('claim service request', async () => {
    // eslint-disable-next-line
    const labPromise: Promise<Lab> = new Promise((resolve, reject) => {
      registerLab(api, pair, labDataMock.info, () => {
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
    });

    lab = await labPromise;
    expect(lab.info).toEqual(labDataMock.info);
    expect(lab.verificationStatus).toEqual(VerificationStatus.Verified);

    // eslint-disable-next-line
    const servicePromise: Promise<Service> = new Promise((resolve, reject) => {
      createService(
        api,
        pair,
        serviceDataMock.info,
        serviceDataMock.serviceFlow,
        () => {
          queryLabById(api, pair.address).then((lab) => {
            queryServicesByMultipleIds(api, lab.services).then((res) => {
              resolve(res.at(-1));
            });
          });
        },
      );
    });

    service = await servicePromise;

    const claimRequestPromise: Promise<ServiceRequest> = new Promise(
      // eslint-disable-next-line
      (resolve, reject) => {
        claimRequest(api, pair, serviceRequest.hash, service.id, () => {
          queryServiceRequestById(api, serviceRequest.hash).then((res) => {
            resolve(res);
          });
        });
      },
    );

    serviceRequest = await claimRequestPromise;
    expect(serviceRequest.normalize()).toEqual(
      expect.objectContaining({
        country: serviceRequestMock.country,
        region: serviceRequestMock.region,
        city: serviceRequestMock.city,
        serviceCategory: serviceRequestMock.serviceCategory,
        status: RequestStatus.Claimed,
      }),
    );

    const serviceRequestES = await elasticsearchService.search({
      index: 'create-service-request',
      body: {
        query: {
          match: {
            _id: {
              query: serviceRequest.hash,
            },
          },
        },
      },
    });

    expect(serviceRequestES.body.hits.hits.length).toEqual(1);
    const serviceRequestSource = serviceRequestES.body.hits.hits[0]._source;

    expect(serviceRequestSource['request']['hash']).toEqual(
      serviceRequest.hash,
    );
    expect(serviceRequestSource['request']['requester_address']).toEqual(
      serviceRequest.requesterAddress,
    );
    expect(serviceRequestSource['request']['country']).toEqual(
      serviceRequest.country,
    );
    expect(serviceRequestSource['request']['city']).toEqual(
      serviceRequest.city,
    );
    expect(serviceRequestSource['request']['region']).toEqual(
      serviceRequest.region,
    );
    expect(serviceRequestSource['request']['service_category']).toEqual(
      serviceRequest.serviceCategory,
    );
    expect(serviceRequestSource['request']['status']).toEqual(
      RequestStatus.Claimed,
    );

    const createServiceRequset = await elasticsearchService.search({
      index: 'create-service-request',
      body: {
        query: {
          match: {
            _id: {
              query: serviceRequest.hash,
            },
          },
        },
      },
    });

    expect(createServiceRequset.body.hits.hits.length).toEqual(1);
    const dataCreateServiceRequest =
      createServiceRequset.body.hits.hits[0]._source;
    expect(dataCreateServiceRequest['request']['country']).toEqual(
      serviceRequestMock.country,
    );
    expect(dataCreateServiceRequest['request']['region']).toEqual(
      serviceRequestMock.region,
    );
    expect(dataCreateServiceRequest['request']['city']).toEqual(
      serviceRequestMock.city,
    );
    expect(dataCreateServiceRequest['request']['status']).toEqual(
      RequestStatus.Claimed,
    );

    // eslint-disable-next-line
    const deleteLabs: Promise<number> = new Promise((resolve, reject) => {
      deleteService(api, pair, service.id, () => {
        deregisterLab(api, pair, () => {
          queryLabCount(api).then((res) => {
            resolve(res);
          });
        });
      });
    });

    expect(await deleteLabs).toEqual(0);
  }, 120000);
});
