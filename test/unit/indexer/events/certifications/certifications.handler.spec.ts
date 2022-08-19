import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createObjectSearchLab,
  ElasticSearchServiceProvider,
} from '../../../mock';
import { BlockMetaData } from '../../../../../src/indexer/models/block-meta-data';
import {
  CertificationCreatedCommandIndexer,
  CertificationDeletedCommandIndexer,
  CertificationsCommandHandlers,
  CertificationUpdatedCommandIndexer,
} from '../../../../../src/indexer/events/certifications';
import { CertificationCreatedHandler } from '../../../../../src/indexer/events/certifications/commands/certification-created/certification-created.handler';
import { CertificationUpdatedHandler } from '../../../../../src/indexer/events/certifications/commands/certification-updated/certification-updated.handler';
import { CertificationDeletedHandler } from '../../../../../src/indexer/events/certifications/commands/certification-deleted/certification-deleted.handler';
import { when } from 'jest-when';

let certificationsCreatedHandler: CertificationCreatedHandler;
let certificationsUpdatedHandler: CertificationUpdatedHandler;
let certificationsDeletedHandler: CertificationDeletedHandler;

let elasticsearchService: ElasticsearchService;

describe('Certifications Substrate Event Handler', () => {
  const createMockCertifications = () => {
    const info = {
      title: 'string',
      issuer: 'string',
      month: 'string',
      year: 'string',
      description: 'string',
      supportingDocument: 'string',
    };
    return {
      toHuman: jest.fn(() => ({
        id: 'string',
        ownerId: 'string',
        info: info,
      })),
    };
  };

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: '',
      blockNumber: 1,
    };
  }

  beforeAll(async () => {
    const modules: TestingModule = await Test.createTestingModule({
      providers: [
        ElasticSearchServiceProvider,
        ...CertificationsCommandHandlers,
      ],
    }).compile();

    certificationsCreatedHandler = modules.get<CertificationCreatedHandler>(
      CertificationCreatedHandler,
    );
    certificationsUpdatedHandler = modules.get<CertificationUpdatedHandler>(
      CertificationUpdatedHandler,
    );
    certificationsDeletedHandler = modules.get<CertificationDeletedHandler>(
      CertificationDeletedHandler,
    );

    elasticsearchService =
      modules.get<ElasticsearchService>(ElasticsearchService);

    await modules.init();
  });

  describe('Certification Handler', () => {
    it('Certification Created Handler', async () => {
      const certifications = createMockCertifications();

      const certificationCreatedCommand: CertificationCreatedCommandIndexer =
        new CertificationCreatedCommandIndexer(
          [certifications],
          mockBlockNumber(),
        );

      await certificationsCreatedHandler.execute(certificationCreatedCommand);
      expect(elasticsearchService.index).toHaveBeenCalled();
      expect(elasticsearchService.update).toHaveBeenCalled();
    });

    it('Certification Updated Handler', async () => {
      const CERTIFICATION_OBJECT = createMockCertifications();
      const LAB_ID = 'string';
      const CALLED_WITH = createObjectSearchLab(LAB_ID);
      const ES_RESULT = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  certifications: [],
                },
              },
            ],
          },
        },
      };

      when(elasticsearchService.search)
        .calledWith(CALLED_WITH)
        .mockReturnValue(ES_RESULT);

      const certificationUpdatedCommand: CertificationUpdatedCommandIndexer =
        new CertificationUpdatedCommandIndexer(
          [CERTIFICATION_OBJECT],
          mockBlockNumber(),
        );

      await certificationsUpdatedHandler.execute(certificationUpdatedCommand);
      expect(elasticsearchService.update).toHaveBeenCalled();
    });

    it('Certification Deleted Handler', async () => {
      const CERTIFICATION_OBJECT = createMockCertifications();
      const LAB_ID = 'string';
      const CALLED_WITH = createObjectSearchLab(LAB_ID);
      const ES_RESULT = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  certifications: [],
                },
              },
            ],
          },
        },
      };

      when(elasticsearchService.search)
        .calledWith(CALLED_WITH)
        .mockReturnValue(ES_RESULT);

      const certificationDeletedCommand: CertificationDeletedCommandIndexer =
        new CertificationDeletedCommandIndexer(
          [CERTIFICATION_OBJECT],
          mockBlockNumber(),
        );

      await certificationsDeletedHandler.execute(certificationDeletedCommand);
      expect(elasticsearchService.delete).toHaveBeenCalled();
      expect(elasticsearchService.update).toHaveBeenCalled();
      expect(elasticsearchService.search).toHaveBeenCalled();
    });
  });
});
