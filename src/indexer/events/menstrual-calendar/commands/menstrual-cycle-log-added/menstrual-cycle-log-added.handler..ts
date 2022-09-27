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
    const { menstrualCycleLog, blockMetaData } = command;
    await this.elasticsearchService.create({
      index: 'menstrual-cycle-log',
      id: menstrualCycleLog.id,
      refresh: 'wait_for',
      body: {
        menstrual_calendar_id: menstrualCycleLog.menstrualCalendarId,
        date: menstrualCycleLog.date,
        menstruation: menstrualCycleLog.menstruation,
        symptoms: menstrualCycleLog.symptoms,
        created_at: menstrualCycleLog.createdAt,
        updated_at: menstrualCycleLog.updatedAt,
        blockMetaData: blockMetaData,
      },
    });
  }
}
