import { ICommandHandler } from '@nestjs/cqrs';
import { ClaimedWaitingServiceRequestCommand } from './claimedwaiting-service-request.command';

export class ClaimedWaitingServiceRequestHandler
  implements ICommandHandler<ClaimedWaitingServiceRequestCommand>
{
  async execute(command: ClaimedWaitingServiceRequestCommand) {
    // Statement for event claimed waiting in service request
  }
}
