import { ICommandHandler } from "@nestjs/cqrs";
import { UnstakedServiceRequestCommand } from "./unstaked-service-request.command";

export class UnstakedServiceRequestHandler implements ICommandHandler<UnstakedServiceRequestCommand> {
  async execute(command: UnstakedServiceRequestCommand) {
    // statement for handle event unstaked service request
  }
}