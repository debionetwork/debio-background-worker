import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MenstrualCycleLogUpdatedCommandIndexer } from './menstrual-cycle-log-updated.command';

@Injectable()
@CommandHandler(MenstrualCycleLogUpdatedCommandIndexer)
export class MenstrualCycleLogUpdatedHandler
  implements ICommandHandler<MenstrualCycleLogUpdatedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: MenstrualCycleLogUpdatedCommandIndexer) {
    const {
      menstrualCycleLog,
      blockMetaData,
    } = command;
    await this.elasticsearchService.update({
      index: 'menstrual-cycle-log',
      id: menstrualCycleLog.id,
      refresh: 'wait_for',
      body: {
        doc: {
          menstrual_calendar_id: menstrualCycleLog.menstrualCalendarId,
          date: menstrualCycleLog.date,
          menstruation: menstrualCycleLog.menstruation,
          symptoms: menstrualCycleLog.symptoms,
          updated_at: menstrualCycleLog.updatedAt,
          blockMetaData: blockMetaData,
        }
      },
    });
  }
}
