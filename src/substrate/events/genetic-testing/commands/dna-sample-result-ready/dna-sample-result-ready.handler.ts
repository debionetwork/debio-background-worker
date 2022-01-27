import { ICommandHandler } from '@nestjs/cqrs';
import { DNASampleResultReadyCommand } from './dna-sample-result-ready.command';

export class DNASampleResultReadyHandler
  implements ICommandHandler<DNASampleResultReadyCommand>
{
  async execute(command: DNASampleResultReadyCommand) {
    // statement for handle event DNA Sample Result Ready
  }
}
