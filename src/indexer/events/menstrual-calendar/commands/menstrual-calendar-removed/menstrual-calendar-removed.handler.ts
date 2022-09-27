import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MenstrualCalendarRemovedCommandIndexer } from './menstrual-calendar-removed.command';

@Injectable()
@CommandHandler(MenstrualCalendarRemovedCommandIndexer)
export class MenstrualCalendarRemovedHandler
  implements ICommandHandler<MenstrualCalendarRemovedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: MenstrualCalendarRemovedCommandIndexer) {
    const { menstrualCalendar } = command;
    await this.elasticsearchService.delete({
      index: 'menstrual-calendar',
      id: menstrualCalendar.id,
      refresh: 'wait_for',
    });
  }
}
