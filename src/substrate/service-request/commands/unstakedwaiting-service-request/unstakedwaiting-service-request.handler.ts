import { ICommandHandler } from "@nestjs/cqrs";
import { UnstakedWaitingServiceRequestCommand } from "./unstakedwaiting-service-request.command";

export class UnstakedWaitingServiceRequestHandler implements ICommandHandler<UnstakedWaitingServiceRequestCommand> {
  async execute(command: UnstakedWaitingServiceRequestCommand) {
    // statement for handle event unstaked waiting service request
  }
}