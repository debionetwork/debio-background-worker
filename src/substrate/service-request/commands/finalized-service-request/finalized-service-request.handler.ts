import { ICommandHandler } from "@nestjs/cqrs";
import { FinalizedServiceRequestCommand } from "./finalized-service-request.command";

export class FinalizedServiceRequestHandler implements ICommandHandler<FinalizedServiceRequestCommand> {
  async execute(command: FinalizedServiceRequestCommand) {
    // statement for event finalized service request
  }
}