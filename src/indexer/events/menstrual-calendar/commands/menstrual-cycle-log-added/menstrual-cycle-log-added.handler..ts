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
    const {
      menstrualCycleLog: {
        id,
        menstrualCalendarId,
        date,
        menstruation,
        symptoms,
        createdAt,
      },
      blockMetaData,
    } = command;
    await this.elasticsearchService.create({
      index: 'menstrual-cycle-log',
      id: id,
      refresh: 'wait_for',
      body: {
        menstrual_calendar_id: menstrualCalendarId,
        date: date,
        menstruation: menstruation,
        symptoms: symptoms,
        created_at: createdAt.getTime(),
        updated_at: null,
        blockMetaData: blockMetaData,
      },
    });
  }
}
