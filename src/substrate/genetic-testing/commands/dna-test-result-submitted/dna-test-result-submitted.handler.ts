import { ICommandHandler } from "@nestjs/cqrs";
import { DNATestResultSubmittedCommand } from "./dna-test-result-submitted.command";

export class DNATestResultSubmittedHandler implements ICommandHandler<DNATestResultSubmittedCommand> {
  async execute(command: DNATestResultSubmittedCommand) {
    // statement for handle event DNA Test result submitted
  }
}