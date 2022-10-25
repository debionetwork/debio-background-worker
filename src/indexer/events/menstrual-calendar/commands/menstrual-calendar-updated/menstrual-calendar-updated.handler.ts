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
    const {
      menstrualCalendar: { id, addressId, averageCycle, cycleLog, updatedAt },
      blockMetaData,
    } = command;
    await this.elasticsearchService.update({
      index: 'menstrual-calendar',
      id: id,
      refresh: 'wait_for',
      body: {
        doc: {
          address_id: addressId,
          average_cycle: averageCycle,
          cycle_log: cycleLog,
          updated_at: updatedAt.getTime(),
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
