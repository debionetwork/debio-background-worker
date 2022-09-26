import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MenstrualCycleLogRemovedCommandIndexer } from './menstrual-cycle-log-removed.command';

@Injectable()
@CommandHandler(MenstrualCycleLogRemovedCommandIndexer)
export class MenstrualCycleLogRemovedHandler
  implements ICommandHandler<MenstrualCycleLogRemovedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: MenstrualCycleLogRemovedCommandIndexer) {
    const {
      menstrualCycleLog,
    } = command;
    await this.elasticsearchService.delete({
      index: 'menstrual-cycle-log',
      id: menstrualCycleLog.id,
      refresh: 'wait_for',
    })
  }
}
