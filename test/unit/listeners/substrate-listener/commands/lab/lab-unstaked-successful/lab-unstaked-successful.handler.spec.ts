import { DateTimeProxy, TransactionLoggingService } from '@common/index';
import { LabUnstakedCommand } from '@listeners/substrate-listener/commands/labs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockLab,
  mockBlockNumber,
  MockType,
  transactionLoggingServiceMockFactory,
  dateTimeProxyMockFactory,
} from '../../../../../mock';
import { labUnstakedHandler } from '@listeners/substrate-listener/commands/labs/unstake-successfull/unstaked-successful.handler';
import { when } from 'jest-when';
import { TransactionRequest } from '@common/transaction-logging/models/transaction-request.entity';

describe('Lab Untaked Successful Handler Event', () => {
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  // Uncomment when this needed
  let dateTimeProxyMock: MockType<DateTimeProxy>;
  let labUnstakeSuccessfullHandler: labUnstakedHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory,
        },
        {
          provide: DateTimeProxy,
          useFactory: dateTimeProxyMockFactory,
        },
        labUnstakedHandler,
      ],
    }).compile();

    labUnstakeSuccessfullHandler = module.get(labUnstakedHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    dateTimeProxyMock = module.get(DateTimeProxy); // eslint-disable-line

    await module.init();
  });

  it('should defined Lab Unstaked Successful Handler', () => {
    expect(labUnstakeSuccessfullHandler).toBeDefined();
  });

  it('should not called logging service create', async () => {
    jest.useFakeTimers();

    // Arrange
    const lab = createMockLab();

    const RESULT_STATUS = {
      created_at: new Date('Thu Jan 24 2022 07:00:00 GMT+0700').getTime(),
    };
    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = new Date();
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(0).toString();
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 0;
    RESULT_TRANSACTION.transaction_hash = 'string';

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(lab.toHuman().accountId, 27)
      .mockReturnValue(RESULT_STATUS);

    const stakedLab: LabUnstakedCommand = new LabUnstakedCommand(
      [lab],
      mockBlockNumber(),
    );

    await labUnstakeSuccessfullHandler.execute(stakedLab);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
  });

  it('should called logging service create', async () => {
    // Arrange
    const lab = createMockLab();

    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = new Date();
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(0).toString();
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 0;
    RESULT_TRANSACTION.transaction_hash = 'string';

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus).calledWith(
      lab.toHuman().accountId,
      27,
    );

    const labStakedSuccessfulCommand: LabUnstakedCommand =
      new LabUnstakedCommand([lab], mockBlockNumber());

    await labUnstakeSuccessfullHandler.execute(labStakedSuccessfulCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    await transactionLoggingServiceMock.create();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
  });
});
