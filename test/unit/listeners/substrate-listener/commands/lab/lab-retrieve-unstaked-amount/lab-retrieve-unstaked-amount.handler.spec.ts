import { DateTimeProxy, TransactionLoggingService } from '@common/index';
import { LabRetrieveUnstakeAmountCommand } from '@listeners/substrate-listener/commands/labs';
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

describe('Lab Retrieve Untaked Amount Handler Event', () => {
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let dateTimeProxyMock: MockType<DateTimeProxy>;
  let labRetrieveUntakedAmountlHandler: labUnstakedHandler;

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

    labRetrieveUntakedAmountlHandler = module.get(labUnstakedHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dateTimeProxyMock = module.get(DateTimeProxy);

    await module.init();
  });

  it('should defined Lab Retrieve Unstaked Amount Handler', () => {
    expect(labRetrieveUntakedAmountlHandler).toBeDefined();
  });

  it('should not called logging service create', async () => {
    // Arrange
    const lab = createMockLab();

    const RESULT_STATUS = true;

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(lab.toHuman().accountId, 26)
      .mockReturnValue(RESULT_STATUS);

    const stakedLab: LabRetrieveUnstakeAmountCommand =
      new LabRetrieveUnstakeAmountCommand([lab], mockBlockNumber());

    await labRetrieveUntakedAmountlHandler.execute(stakedLab);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
  });

  it('should called logging service create', async () => {
    // Arrange
    const lab = createMockLab();

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus).calledWith(
      lab.toHuman().accountId,
      26,
    );

    const labStakedSuccessfulCommand: LabRetrieveUnstakeAmountCommand =
      new LabRetrieveUnstakeAmountCommand([lab], mockBlockNumber());

    await labRetrieveUntakedAmountlHandler.execute(labStakedSuccessfulCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    await transactionLoggingServiceMock.create();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
  });
});
