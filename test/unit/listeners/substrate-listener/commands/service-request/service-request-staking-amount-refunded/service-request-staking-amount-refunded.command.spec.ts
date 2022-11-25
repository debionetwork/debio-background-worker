import { ServiceRequestStakingAmountRefundedCommand } from '@listeners/substrate-listener/commands/service-request';
import { BlockMetaData } from '@listeners/substrate-listener/models/block-metadata.event-model';

jest.mock('@debionetwork/polkadot-provider');

describe('Service Request Staking Amount Refunded Command Event', () => {
  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: 'string',
      blockNumber: 1,
    };
  }

  it('should called Model and toHuman()', () => {
    const REQUESTER_ID = 'XX';
    const REQUEST_ID = 'XX';
    const STAKING_AMOUNT = '1';
    const MOCK_DATA = new Array<string>(
      REQUESTER_ID,
      REQUEST_ID,
      STAKING_AMOUNT,
    );
    const serviceRequestStakingAmountRefunded =
      new ServiceRequestStakingAmountRefundedCommand(
        MOCK_DATA,
        mockBlockNumber(),
      );

    expect(serviceRequestStakingAmountRefunded.requesterId).toEqual(
      REQUESTER_ID,
    );
    expect(serviceRequestStakingAmountRefunded.requestId).toEqual(REQUEST_ID);
  });
});
