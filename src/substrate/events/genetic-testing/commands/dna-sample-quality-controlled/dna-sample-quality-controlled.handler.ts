import { ICommandHandler } from "@nestjs/cqrs";
import { DNASampleQualityControlledCommand } from "./dna-sample-quality-controlled.command";

export class DNASampleQualityControlledHandler implements ICommandHandler<DNASampleQualityControlledCommand> {
  async execute(command: DNASampleQualityControlledCommand) {
    // statement for handle event DNA Sample Quality Controlled
  }
}