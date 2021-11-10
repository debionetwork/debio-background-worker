import { ICommandHandler } from "@nestjs/cqrs";
import { ProcessedServiceRequestCommand } from "./processed-service-request.command";

export class ProcessedServiceRequestHandler implements ICommandHandler<ProcessedServiceRequestCommand> {
  async execute(command: ProcessedServiceRequestCommand) {
    // statement for handle event Processed Service Request
  }
}