import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MenstrualCycleLogsAddedCommandIndexer } from './menstrual-cycle-log-added.command';

@Injectable()
@CommandHandler(MenstrualCycleLogsAddedCommandIndexer)
export class MenstrualCycleLogsAddedHandler
  implements ICommandHandler<MenstrualCycleLogsAddedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: MenstrualCycleLogsAddedCommandIndexer) {
    const { menstrualCycleLog, accountId, blockMetaData } = command;

    for (let key = 0; key < menstrualCycleLog.length; key++) {
      await this.elasticsearchService.create({
        index: 'menstrual-cycle-log',
        id: menstrualCycleLog[key].id,
        refresh: 'wait_for',
        body: {
          menstrual_calendar_cycle_log_id: menstrualCycleLog[key].id,
          account_id: accountId,
          menstrual_calendar_id: menstrualCycleLog[key].menstrualCalendarId,
          date: menstrualCycleLog[key].date.getTime(),
          menstruation: menstrualCycleLog[key].menstruation,
          symptoms: menstrualCycleLog[key].symptoms,
          created_at: menstrualCycleLog[key].createdAt.getTime(),
          updated_at: null,
          blockMetaData: blockMetaData,
        },
      });
    }
  }
}
