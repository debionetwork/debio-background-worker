import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ErrorLoggingService } from '../../../../../src/common/error-logging/error-logging.service';
import { ErrorLogging } from '../../../../../src/common/error-logging/models/error-logging.entity';
import {
  dateTimeProxyMockFactory,
  MockType,
  repositoryMockFactory,
} from '../../../mock';
import { Repository } from 'typeorm';
import { ErrorLoggingDto } from '../../../../../src/common/error-logging/dto/error-logging.dto';
import { DateTimeProxy } from '../../../../../src/common/proxies/date-time/date-time.proxy';

describe('ErrorLogging Service Unit Tests', () => {
  let errorLoggingService: ErrorLoggingService;
  let repositoryMock: MockType<Repository<ErrorLogging>>;
  let dateTimeProxyMock: MockType<DateTimeProxy>;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErrorLoggingService,
        { provide: DateTimeProxy, useFactory: dateTimeProxyMockFactory },
        {
          provide: getRepositoryToken(ErrorLogging),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    errorLoggingService = module.get(ErrorLoggingService);
    repositoryMock = module.get(getRepositoryToken(ErrorLogging));
    dateTimeProxyMock = module.get(DateTimeProxy);
  });

  it('should be defined', () => {
    // Assert
    expect(errorLoggingService).toBeDefined();
  });

  it('should find all by to Id', () => {
    // Arrange
    const TO_CODE = 'CODE';
    const RESULTS = [
      {
        errorLogging: 'ErrorLogging 1',
      },
    ];
    const PARAM = {
      where: {
        to: TO_CODE,
        resolve: false,
      },
      order: {
        updated_at: 'DESC',
      },
    };
    repositoryMock.find.mockReturnValue(RESULTS);

    // Assert
    expect(errorLoggingService.getAllByToId(TO_CODE)).toEqual(RESULTS);
    expect(repositoryMock.find).toHaveBeenCalledWith(PARAM);
    expect(repositoryMock.find).toHaveBeenCalled();
  });

  it('insert should return', () => {
    // Arrange
    const CURRENT_DATE = new Date();
    const RESULTS = [
      {
        errorLogging: 'ErrorLogging 1',
      },
    ];
    const CALLED_WITH: ErrorLoggingDto = {
      tx_hash: 'string',
      block_number: 'string',
      description: 'string',
      resolve: false,
      created_at: CURRENT_DATE,
      updated_at: CURRENT_DATE,
      from: 'string',
      to: 'string',
    };

    repositoryMock.save.mockReturnValue(RESULTS);

    // Assert
    expect(errorLoggingService.insert(CALLED_WITH)).toEqual(RESULTS);
    expect(repositoryMock.save).toHaveBeenCalledWith(CALLED_WITH);
    expect(repositoryMock.save).toHaveBeenCalled();
  });

  it('setErrorLoggingHasBeenResolveById should return', async () => {
    // Arrange
    const ID = 0;
    const CURRENT_DATE = new Date();
    const RESULTS = [
      {
        errorLogging: 'ErrorLogging 1',
      },
    ];
    const CALLED_WITH = {
      updated_at: CURRENT_DATE,
      resolve: true,
    };

    dateTimeProxyMock.new.mockReturnValue(CURRENT_DATE);

    repositoryMock.update.mockReturnValue(RESULTS);

    // Assert
    expect(
      await errorLoggingService.setErrorLoggingHasBeenResolveById(ID),
    ).toEqual(RESULTS);
    expect(repositoryMock.update).toHaveBeenCalledWith({ id: ID }, CALLED_WITH);
    expect(repositoryMock.update).toHaveBeenCalled();
  });

  it('setBulkErrorLoggingHasBeenResolve should return', async () => {
    // Arrange
    const TO = 0;
    const CURRENT_DATE = new Date();
    const RESULTS = [
      {
        errorLogging: 'ErrorLogging 1',
      },
    ];
    const CALLED_WITH = {
      updated_at: CURRENT_DATE,
      resolve: true,
    };

    dateTimeProxyMock.new.mockReturnValue(CURRENT_DATE);

    repositoryMock.update.mockReturnValue(RESULTS);

    // Assert
    expect(
      await errorLoggingService.setErrorLoggingHasBeenResolveById(TO),
    ).toEqual(RESULTS);
    expect(repositoryMock.update).toHaveBeenCalledWith({ id: TO }, CALLED_WITH);
    expect(repositoryMock.update).toHaveBeenCalled();
  });
});
