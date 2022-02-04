import { ICommandHandler } from '@nestjs/cqrs';
import { DNASampleQualityRegisteredCommand } from './dna-sample-registered.command';

export class DNASampleQualityRegisteredHandler
  implements ICommandHandler<DNASampleQualityRegisteredCommand>
{
  async execute(command: DNASampleQualityRegisteredCommand) {
    // statement for handle event DNA Sample Quality Registered
  }
}
