import { ICommandHandler } from "@nestjs/cqrs";
import { IncreasedServiceRequestCommand } from "./increased-service-request.command";

export class IncreasedServiceRequestHandler implements ICommandHandler<IncreasedServiceRequestCommand> {
  async execute(command: IncreasedServiceRequestCommand) {
    // statement to handle event Increased Service Request
  }
}