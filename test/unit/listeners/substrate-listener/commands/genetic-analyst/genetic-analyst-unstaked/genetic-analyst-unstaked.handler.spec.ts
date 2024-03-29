import { DateTimeProxy, TransactionLoggingService } from '@common/index';
import { GeneticAnalystUnstakedCommand } from '@listeners/substrate-listener/commands/genetic-analysts';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockGeneticAnalyst,
  mockBlockNumber,
  MockType,
  transactionLoggingServiceMockFactory,
  dateTimeProxyMockFactory,
} from '../../../../../mock';
import { GeneticAnalystUnstakedHandler } from '@listeners/substrate-listener/commands/genetic-analysts/genetic-analyst-unstake/genetic-analyst-unstaked.handler';
import { when } from 'jest-when';

describe('Genetic Analyst Staked Handler Event', () => {
  let geneticAnalystUnstakedHandler: GeneticAnalystUnstakedHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let dateTimeProxyMock: MockType<DateTimeProxy>;

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
        GeneticAnalystUnstakedHandler,
      ],
    }).compile();

    geneticAnalystUnstakedHandler = module.get(GeneticAnalystUnstakedHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dateTimeProxyMock = module.get(DateTimeProxy);

    await module.init();
  });

  it('should defined Genetic Analyst Unstaked Handler', () => {
    expect(geneticAnalystUnstakedHandler).toBeDefined();
  });

  it('should not called logging service create', async () => {
    // Arrange
    const geneticAnalyst = createMockGeneticAnalyst();

    const RESULT_STATUS = true;

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(geneticAnalyst.toHuman().accountId, 19)
      .mockReturnValue(RESULT_STATUS);

    const geneticAnalystOrders: GeneticAnalystUnstakedCommand =
      new GeneticAnalystUnstakedCommand([geneticAnalyst], mockBlockNumber());

    await geneticAnalystUnstakedHandler.execute(geneticAnalystOrders);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
  });

  it('should called logging service create', async () => {
    // Arrange
    const geneticAnalyst = createMockGeneticAnalyst();

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus).calledWith(
      geneticAnalyst.toHuman().accountId,
      19,
    );

    const geneticAnalystUnstakedCommand: GeneticAnalystUnstakedCommand =
      new GeneticAnalystUnstakedCommand([geneticAnalyst], mockBlockNumber());

    await geneticAnalystUnstakedHandler.execute(geneticAnalystUnstakedCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    await transactionLoggingServiceMock.create();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
  });
});
