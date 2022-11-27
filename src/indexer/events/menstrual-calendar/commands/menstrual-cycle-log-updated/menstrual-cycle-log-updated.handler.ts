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
    const { menstrualCycleLog, blockMetaData } = command;

    for (let key = 0; key < menstrualCycleLog.length; key++) {
      await this.elasticsearchService.update({
        index: 'menstrual-cycle-log',
        id: menstrualCycleLog[key].id,
        refresh: 'wait_for',
        body: {
          doc: {
            menstrual_calendar_id: menstrualCycleLog[key].menstrualCalendarId,
            menstruation: menstrualCycleLog[key].menstruation,
            symptoms: menstrualCycleLog[key].symptoms,
            updated_at: menstrualCycleLog[key].updatedAt.getTime(),
            blockMetaData: blockMetaData,
          },
        },
      });
    }
  }
}
