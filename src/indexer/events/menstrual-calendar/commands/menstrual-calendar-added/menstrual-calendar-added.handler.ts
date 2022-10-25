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
    const {
      menstrualCalendar: { id, addressId, averageCycle, cycleLog, createdAt },
      blockMetaData,
    } = command;
    await this.elasticsearchService.create({
      index: 'menstrual-calendar',
      id: id,
      refresh: 'wait_for',
      body: {
        address_id: addressId,
        average_cycle: averageCycle,
        cycle_log: cycleLog,
        created_at: createdAt.getTime(),
        updated_at: null,
        blockMetaData: blockMetaData,
      },
    });
  }
}
