import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SchedulerRegistry } from '@nestjs/schedule';
import { SubstrateService } from '@common/index';
import { keyList } from '@common/secrets';
import {
  queryMenstrualSubscriptionById
} from '@debionetwork/polkadot-provider/lib/query/menstrual-subscription';

@Injectable()
export class MenstrualSubscriptionService {
  private logger: Logger = new Logger(MenstrualSubscriptionService.name);
  private isRunning = false;
  private timer: number;
  constructor(
    private readonly gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly subtrateService: SubstrateService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    this.timer = this.strToMilisecond(
      this.gCloudSecretManagerService.getSecret('UNSTAKE_TIMER').toString(),
    );
    const unstakeInterval: number = this.strToMilisecond(
      this.gCloudSecretManagerService.getSecret('UNSTAKE_INTERVAL').toString(),
    );

    const menstrualSubscription = setInterval(async () => {
      await this.handleWaitingUnstaked();
    }, unstakeInterval);
    this.schedulerRegistry.addInterval('menstrual-subscription', menstrualSubscription);
  }

  async handleWaitingUnstaked() {
    try {
      if (this.isRunning || this.subtrateService.api === undefined) return;

      this.isRunning = true;
      const menstrualSubscription = await this.elasticsearchService.search({
        index: 'menstrual-subscription',
        allow_no_indices: true,
        body: {
          query: {
            match: {
              status: {
                query: 'Active',
              },
            },
          },
          sort: [
            {
              'created_at.keyword': {
                unmapped_type: 'keyword',
                order: 'asc',
              },
            },
          ],
        },
        from: 0,
        size: 10,
      });

      const currtime = new Date().getTime();

      const listMenstrualSubscription = menstrualSubscription.body.hits.hits;
      for (const menstrualSubscription of listMenstrualSubscription) {
        if (this.subtrateService.api === undefined) break;

        const menstrualSubscriptionId = menstrualSubscription['_source']['id'];
        const duration = menstrualSubscription['_source']['duration'];
        const date = menstrualSubscription['_source']['updated_at'];

        const menstrualSubscriptionData = await queryMenstrualSubscriptionById(
          this.subtrateService.api,
          menstrualSubscriptionId,
        );

        if (menstrualSubscriptionData.status === 'Inactive') {
          await this.elasticsearchService.update({
            index: 'menstrual-subscription',
            id: menstrualSubscriptionId,
            refresh: 'wait_for',
            body: {
              doc: {
                status: "Inactive",
              },
            },
          });
        } else if (menstrualSubscriptionData.status === "Active" && this.checkTimeDurationEnd(currtime, date, duration)) {
          await this.subtrateService.api.tx.menstrualSubscription
            .changeMenstrualSubscriptionStatus(
              menstrualSubscriptionId,
              'Inactive',
            )
            .signAndSend(this.subtrateService.pair, { nonce: -1 });
        }
      }
    } catch (err) {
      this.logger.error(`inactive menstrual subscription error ${err}`);
    } finally {
      this.isRunning = false;
    }
  }

  private milisecondsConverter = {
    Monthly: 30 * 24 * 60 * 60 * 1000,
    Quarterly: 3 * 30 * 24 * 60 * 60 * 1000,
    Yearly: 12 * 30 * 24 * 60 * 60 * 1000,
  };

  checkTimeDurationEnd(
    currtime: number,
    date: number,
    duration: string,
  ): boolean {
    return currtime >= date + this.milisecondsConverter[duration];
  }

  strToMilisecond(timeFormat: string): number {
    // time format must DD:HH:MM:SS
    const splitTimeFormat = timeFormat.split(':');

    const d = Number(splitTimeFormat[0]);
    const h = Number(splitTimeFormat[1]);
    const m = Number(splitTimeFormat[2]);
    const s = Number(splitTimeFormat[3]);

    const dayToMilisecond = d * 24 * 60 * 60 * 1000;
    const hourToMilisecond = h * 60 * 60 * 1000;
    const minuteToMilisecond = m * 60 * 1000;
    const secondToMilisecond = s * 1000;

    const result =
      dayToMilisecond +
      hourToMilisecond +
      minuteToMilisecond +
      secondToMilisecond;

    return result;
  }
}
