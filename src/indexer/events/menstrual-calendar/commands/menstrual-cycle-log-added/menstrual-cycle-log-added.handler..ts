import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MenstrualCycleLogAddedCommandIndexer } from './menstrual-cycle-log-added.command';

@Injectable()
@CommandHandler(MenstrualCycleLogAddedCommandIndexer)
export class MenstrualCycleLogAddedHandler
  implements ICommandHandler<MenstrualCycleLogAddedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: MenstrualCycleLogAddedCommandIndexer) {
    const { menstrualCycleLog, accountId, blockMetaData } = command;

    const bulk_data = [];

    for (const cycleLog of menstrualCycleLog) {
      bulk_data.push(
        { index: { _index: 'menstrual-cycle-log', _id: cycleLog.id } },
        {
          menstrual_calendar_cycle_log_id: cycleLog.id,
          account_id: accountId,
          menstrual_calendar_id: cycleLog.menstrualCalendarId,
          date: cycleLog.date.getTime(),
          menstruation: cycleLog.menstruation,
          symptoms: cycleLog.symptoms,
          created_at: cycleLog.createdAt.getTime(),
          updated_at: null,
          blockMetaData: blockMetaData,
        },
      );
    }

    await this.elasticsearchService.bulk({
      refresh: 'wait_for',
      body: bulk_data,
    });
  }
}
