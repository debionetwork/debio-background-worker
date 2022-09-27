import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MenstrualCalendarAddedCommandIndexer } from './menstrual-calendar-added.command';

@Injectable()
@CommandHandler(MenstrualCalendarAddedCommandIndexer)
export class MenstrualCalendarAddedHandler
  implements ICommandHandler<MenstrualCalendarAddedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: MenstrualCalendarAddedCommandIndexer) {
    const { menstrualCalendar, blockMetaData } = command;
    await this.elasticsearchService.create({
      index: 'menstrual-calendar',
      id: menstrualCalendar.id,
      refresh: 'wait_for',
      body: {
        address_id: menstrualCalendar.addressId,
        average_cycle: menstrualCalendar.averageCycle,
        cycle_log: menstrualCalendar.cycleLog,
        created_at: menstrualCalendar.createdAt,
        updated_at: menstrualCalendar.updatedAt,
        blockMetaData: blockMetaData,
      },
    });
  }
}
