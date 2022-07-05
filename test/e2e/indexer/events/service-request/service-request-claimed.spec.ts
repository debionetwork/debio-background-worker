import { Test, TestingModule } from '@nestjs/testing';
import { IndexerHandler } from '../../../../../src/indexer/indexer.handler';
import { CommonModule } from '../../../../../src/common/common.module';
import { ProcessEnvModule } from '../../../../../src/common/process-env/process-env.module';
import { ServiceCommandHandlers } from '../../../../../src/indexer/events/services';
import { INestApplication } from '@nestjs/common';
import { initializeApi } from '../../../polkadot-init';
import { ApiPromise } from '@polkadot/api';
import {
  claimRequest,
  createRequest,
  createService,
  Lab,
  queryLabById,
  queryServiceRequestByAccountId,
  queryServiceRequestById,
  queryServicesByMultipleIds,
  registerLab,
  RequestStatus,
  Service,
  ServiceRequest,
  updateLabVerificationStatus,
} from '@debionetwork/polkadot-provider';
import {
  ElasticsearchModule,
  ElasticsearchService,
} from '@nestjs/elasticsearch';
import { CqrsModule } from '@nestjs/cqrs';
import { labDataMock } from '../../../../mock/models/labs/labs.mock';
import { VerificationStatus } from '@debionetwork/polkadot-provider/lib/primitives/verification-status';
import { serviceDataMock } from '../../../../mock/models/labs/service.mock';
import { LabCommandHandlers } from '../../../../../src/indexer/events/labs';
import { RequestServiceCommandHandlers } from '../../../../../src/indexer/events/service-request';
import { ScheduleModule } from '@nestjs/schedule';
import { IndexerModule } from '../../../../../src/indexer/indexer.module';
import { serviceRequestMock } from '../../../../mock/models/service-request/service-request.mock';

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
        ElasticsearchModule.registerAsync({
          useFactory: async () => {
            return {
              node: process.env.ELASTICSEARCH_NODE,
              auth: {
                username: process.env.ELASTICSEARCH_USERNAME,
                password: process.env.ELASTICSEARCH_PASSWORD,
              },
            };
          },
        }),
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
    api.disconnect();
    await elasticsearchService.close();
  });

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

    serviceRequest = await createServicePromise;
    expect(serviceRequest.normalize()).toEqual(
      expect.objectContaining({
        country: serviceRequestMock.country,
        region: serviceRequestMock.region,
        city: serviceRequestMock.city,
        serviceCategory: serviceRequestMock.serviceCategory,
      }),
    );

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
        claimRequest(
          api,
          pair,
          serviceRequest.hash,
          service.id,
          '1',
          '1',
          () => {
            queryServiceRequestById(api, serviceRequest.hash).then((res) => {
              resolve(res);
            });
          },
        );
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
    expect(dataRegionServiceRequest['service_request']).toEqual([]);
  }, 120000);
});
