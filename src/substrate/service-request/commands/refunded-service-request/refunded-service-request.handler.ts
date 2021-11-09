import { ICommandHandler } from "@nestjs/cqrs";
import { RefundedServiceRequestCommand } from "./refunded-service-request.command";

export class RefundedServiceRequestHandler implements ICommandHandler<RefundedServiceRequestCommand> {
  async execute(command: RefundedServiceRequestCommand) {
    // statement for event handle refunded service request
  }
}