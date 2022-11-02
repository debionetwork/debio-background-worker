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
      menstrualCycleLog: {
        id,
        menstrualCalendarId,
        date,
        menstruation,
        symptoms,
        updatedAt,
      },
      blockMetaData,
    } = command;
    await this.elasticsearchService.update({
      index: 'menstrual-cycle-log',
      id: id,
      refresh: 'wait_for',
      body: {
        doc: {
          menstrual_calendar_id: menstrualCalendarId,
          date: date.getTime(),
          menstruation: menstruation,
          symptoms: symptoms,
          updated_at: updatedAt.getTime(),
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
