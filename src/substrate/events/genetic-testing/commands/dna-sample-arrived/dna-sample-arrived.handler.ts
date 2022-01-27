import { ICommandHandler } from '@nestjs/cqrs';
import { DNASampleArrivedCommand } from './dna-sample-arrived.command';

export class DNASampleArrivedHandler
  implements ICommandHandler<DNASampleArrivedCommand>
{
  async execute(command: DNASampleArrivedCommand) {
    // statement for handle eent DNA Sample Arrived
  }
}
