import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SubstrateController, SubstrateService } from '../../src/substrate/substrate.handler';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const SubstrateServiceProvider = {
    provide: SubstrateService,
    useFactory: () => ({
      onModuleInit: jest.fn(),
      handleEvent: jest.fn(),
      listenToEvents: jest.fn(),
      listenToNewBlock: jest.fn(),
      syncBlock: jest.fn(),
      startListen: jest.fn()
    })
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        SubstrateController
      ],
      providers: [
        SubstrateService,
        SubstrateServiceProvider
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/substrate (Get)', async () => {
    return request(app.getHttpServer())
      .get('/substrate')
      .expect(404);
  });
});
