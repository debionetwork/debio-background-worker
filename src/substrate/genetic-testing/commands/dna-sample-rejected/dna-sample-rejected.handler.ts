import { ICommandHandler } from "@nestjs/cqrs";
import { DNASampleRejectedCommand } from "./dna-sample-rejected.command";

export class DNASampleRejectedHandler implements ICommandHandler<DNASampleRejectedCommand> {
  async execute(command: DNASampleRejectedCommand) {
    // statement for handle event DNA Sample rejected
  }
}