import { Test, TestingModule } from '@nestjs/testing';
import { EscrowService } from '../../../../src/common/escrow/escrow.service';
import { EthereumListenerHandler } from '../../../../src/listeners/ethereum-listener/ethereum-listener.handler';
import {
  EthereumService,
  TransactionLoggingService,
} from '../../../../src/common';
import { transactionLoggingServiceMockFactory } from '../../../../test/unit/mock';

describe('Ethereum Listener Handler Unit Test', () => {
  let ethereumListenerHandler: EthereumListenerHandler;
  let ethereumService: EthereumService;
  let escrowService: EscrowService;
  let transactionLoggingService: TransactionLoggingService;

  let providerOnEventType = '';
  let smartContractOnEventType = '';

  const ORDER_ID = 1;
  const BLOCK_NUM = 1;

  const escrowServiceProvider = {
    provide: EscrowService,
    useFactory: () => ({
      handlePaymentToEscrow: jest.fn(),
      createOrder: jest.fn(),
      refundOrder: jest.fn(),
      cancelOrder: jest.fn(),
      orderFulfilled: jest.fn(),
      forwardPaymentToSeller: jest.fn(),
      setOrderPaidWithSubstrate: jest.fn(),
      getRefundGasEstimationFee: jest.fn(() => ''),
    }),
  };

  const contractMock = {
    filters: {
      Transfer: jest.fn(),
    },
  };

  const ethereumServiceProvider = {
    provide: EthereumService,
    useFactory: () => ({
      getLastBlock: jest.fn(() => 5484750),
      setLastBlock: jest.fn(),
      getContract: jest.fn(() => ({
        provider: {
          getBlockNumber: () => 5484751,
          on: (type, fn) => {
            providerOnEventType = type;
            fn(BLOCK_NUM);
          },
          emit: jest.fn(),
        },
        on: () => null,
        filters: {
          Transfer: () => null,
        },
        emit: jest.fn(),
      })),
      getEscrowSmartContract: jest.fn(() => ({
        on: (type, fn) => {
          smartContractOnEventType = type;
          const orderEventMock = {
            orderId: ORDER_ID,
            transactionHash: 'string',
          };
          fn(orderEventMock);
        },
      })),
      createWallet: jest.fn(),
      getGasEstimationFee: jest.fn(() => ''),
      convertCurrency: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EthereumListenerHandler,
        escrowServiceProvider,
        ethereumServiceProvider,
        {
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory,
        },
      ],
    }).compile();

    ethereumListenerHandler = module.get<EthereumListenerHandler>(
      EthereumListenerHandler,
    );
    ethereumService = module.get(EthereumService);
    escrowService = module.get(EscrowService);
    transactionLoggingService = module.get(TransactionLoggingService);

    providerOnEventType = '';
    smartContractOnEventType = '';
  });

  it('should be defined', () => {
    expect(ethereumListenerHandler).toBeDefined();
  });

  it('should be defined', () => {
    expect(ethereumService).toBeDefined();
  });

  it('should be defined', () => {
    expect(escrowService).toBeDefined();
  });

  it('should be defined', () => {
    expect(transactionLoggingService).toBeDefined();
  });

  it('should start listening to events', async () => {
    // Arrange

    // Act
    await ethereumListenerHandler.listenToEvents();

    // Assert
    expect(ethereumService.getContract).toBeCalled();

    expect(ethereumService.getEscrowSmartContract).toBeCalled();

    expect(ethereumService.getLastBlock).toBeCalled();

    expect(providerOnEventType).toEqual('block');
    expect(ethereumService.setLastBlock).toBeCalledTimes(2);
    expect(ethereumService.setLastBlock).toHaveBeenCalledWith(BLOCK_NUM);

    expect(smartContractOnEventType).toEqual('OrderRefunded');
    expect(
      transactionLoggingService.getLoggingByHashAndStatus,
    ).toHaveBeenCalledTimes(1);
    expect(
      transactionLoggingService.getLoggingByHashAndStatus,
    ).toHaveBeenCalledWith(ORDER_ID, 4);
    expect(
      transactionLoggingService.getLoggingByHashAndStatus,
    ).toHaveBeenCalledWith(ORDER_ID, 4);
  });

  it('should sync one block', async () => {
    // Arrange
    const MIN = 5484745;
    const CURRENT = MIN + 1;

    // Act
    await ethereumListenerHandler.syncBlock(MIN, CURRENT, contractMock);

    // Assert
    expect(contractMock.filters.Transfer).toHaveBeenCalled();
    expect(contractMock.filters.Transfer).toHaveBeenCalledWith(
      null,
      '0x42D57aAA086Ee6575Ddd3b502af1b07aEa91E495',
    );
    expect(ethereumService.setLastBlock).toBeCalledTimes(1);
    expect(ethereumService.setLastBlock).toHaveBeenCalledWith(CURRENT);
  });
});
