import { DateTimeProxy } from '@common/index';
import { NotificationService } from '@common/notification/notification.service';
import {
  createMockDnaSample,
  dateTimeProxyMockFactory,
  mockBlockNumber,
  MockType,
  notificationServiceMockFactory,
} from '../../../../../mock';
import { DnaSampleRejectedCommandHandler } from '@listeners/substrate-listener/commands/genetic-testing/dna-sample-rejected/dna-sample-rejected.handler';
import { Test, TestingModule } from '@nestjs/testing';
import { DnaSampleRejectedCommand } from '@listeners/substrate-listener/commands/genetic-testing';

describe('DNA Sample Rejected Handler Event', () => {
  let notificationServiceMock: MockType<NotificationService>;
  let dateTimeProxyMock: MockType<DateTimeProxy>;
  let dnaSampleRejectedHandler: MockType<DnaSampleRejectedCommandHandler>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: NotificationService,
          useFactory: notificationServiceMockFactory,
        },
        {
          provide: DateTimeProxy,
          useFactory: dateTimeProxyMockFactory,
        },
        DnaSampleRejectedCommandHandler,
      ],
    }).compile();

    notificationServiceMock = module.get(NotificationService);
    dnaSampleRejectedHandler = module.get(DnaSampleRejectedCommandHandler);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dateTimeProxyMock = module.get(DateTimeProxy);

    await module.init();
  });

  it('should defined Dna Sample Rejected Handler', () => {
    expect(dnaSampleRejectedHandler).toBeDefined();
  });

  it('should called notification service insert', async () => {
    // Arrange
    const dnaSampleData = createMockDnaSample();
    const dnaSample = dnaSampleData.toHuman();

    const dnaSampleRejectedCommand = new DnaSampleRejectedCommand(
      [dnaSampleData],
      mockBlockNumber(),
    );

    dnaSampleRejectedHandler.execute(dnaSampleRejectedCommand);
    expect(notificationServiceMock.insert).toBeCalledTimes(1);
    expect(notificationServiceMock.insert).toBeCalledWith(
      expect.objectContaining({
        role: 'Customer',
        entity_type: 'Genetic Testing Tracking',
        entity: 'QC Failed',
        reference_id: dnaSample.trackingId,
        description: `Your sample from [] has been rejected. Click here to see your order details.`,
        read: false,
        deleted_at: null,
        from: 'Debio Network',
        to: dnaSample.ownerId,
        block_number: '1',
      }),
    );
  });
});
