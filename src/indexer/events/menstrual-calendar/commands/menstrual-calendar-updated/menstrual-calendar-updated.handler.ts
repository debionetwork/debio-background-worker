import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MenstrualCalendarUpdatedCommandIndexer } from './menstrual-calendar-updated.command';

@Injectable()
@CommandHandler(MenstrualCalendarUpdatedCommandIndexer)
export class MenstrualCalendarUpdatedHandler
  implements ICommandHandler<MenstrualCalendarUpdatedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: MenstrualCalendarUpdatedCommandIndexer) {
    const { menstrualCalendar, blockMetaData } = command;
    await this.elasticsearchService.update({
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
