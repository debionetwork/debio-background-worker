import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SchedulerRegistry } from '@nestjs/schedule';
import { SubstrateService } from '@common/index';
import { keyList } from '@common/secrets';
import { changeMenstrualSubscriptionStatus } from '@debionetwork/polkadot-provider/lib/command/menstrual-subscription';
import { queryMenstrualSubscriptionById } from '@debionetwork/polkadot-provider/lib/query/menstrual-subscription';
import { SubscriptionStatus } from '@debionetwork/polkadot-provider/lib/primitives/subscription-status';

@Injectable()
export class MenstrualSubscriptionService {
  private logger: Logger = new Logger(MenstrualSubscriptionService.name);
  private isRunningInActive = false;
  private isRunningInQueue = false;
  private timer: number;
  private menstrualSubscriptionDuration: { [key: string]: number };
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

    this.menstrualSubscriptionDuration =
      this.parseMenstrualSubscriptionDuration();

    const menstrualSubscriptionInActive = setInterval(async () => {
      await this.handleInActiveMenstrualSubscription();
    }, unstakeInterval);
    const menstrualSubscriptionInQueue = setInterval(async () => {
      await this.handleInQueueMenstrualSubscription();
    }, unstakeInterval);
    this.schedulerRegistry.addInterval(
      'menstrual-subscription-inactive',
      menstrualSubscriptionInActive,
    );
    this.schedulerRegistry.addInterval(
      'menstrual-subscription-inqueue',
      menstrualSubscriptionInQueue
    );
  }

  async handleInQueueMenstrualSubscription() {
    try {
      if (this.isRunningInQueue || this.subtrateService.api === undefined) return;

      this.isRunningInQueue = true;
      const menstrualSubscription = await this.elasticsearchService.search({
        index: 'menstrual-subscription',
        allow_no_indices: true,
        body: {
          query: {
            match: {
              status: {
                query: 'InQueue',
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

      const listMenstrualSubscription = menstrualSubscription.body.hits.hits;
      for (const menstrualSubscription of listMenstrualSubscription) {
        if (this.subtrateService.api === undefined) break;

        const menstrualSubscriptionId = menstrualSubscription['_source']['id'];

        const menstrualSubscriptionData = await queryMenstrualSubscriptionById(
          this.subtrateService.api,
          menstrualSubscriptionId,
        );

        if (menstrualSubscriptionData.status as any === 'InQueue') {
          await this.subtrateService.api.tx.menstrualSubscription
            .changeMenstrualSubscriptionStatus(
              menstrualSubscriptionId,
              'Active',
            )
            .signAndSend(this.subtrateService.pair, { nonce: -1 });
        } else if (menstrualSubscription.status === 'Active') {
          await this.elasticsearchService.update({
            index: 'menstrual-subscription',
            id: menstrualSubscriptionId,
            refresh: 'wait_for',
            body: {
              doc: {
                status: 'Active',
              },
            },
          });
        }
      }
    } catch (err) {
      this.logger.error(`active menstrual subscription error ${err}`);
    } finally {
      this.isRunningInQueue = false;
    }
  }

  async handleInActiveMenstrualSubscription() {
    try {
      if (this.isRunningInActive || this.subtrateService.api === undefined) return;

      this.isRunningInActive = true;
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
                status: 'Inactive',
              },
            },
          });
        } else if (
          menstrualSubscriptionData.status === 'Active' &&
          this.checkTimeDurationEnd(currtime, date, duration)
        ) {
          await changeMenstrualSubscriptionStatus(
            this.subtrateService.api,
            this.subtrateService.pair,
            menstrualSubscriptionId,
            SubscriptionStatus.Inactive,
          );
        }
      }
    } catch (err) {
      this.logger.error(`inactive menstrual subscription error ${err}`);
    } finally {
      this.isRunningInActive = false;
    }
  }

  checkTimeDurationEnd(
    currtime: number,
    date: number,
    duration: string,
  ): boolean {
    return currtime >= date + this.menstrualSubscriptionDuration[duration];
  }

  parseMenstrualSubscriptionDuration(): { [key: string]: number } {
    try {
      const menstrualSubscriptionDurationObj: { [key: string]: string } =
        JSON.parse(
          this.gCloudSecretManagerService
            .getSecret('MENSTRUAL_SUBSCRIPTION_DURATION')
            .toString() ?? '{}',
        );
      const parseMenstrualSubscriptionDuration: Map<string, number> = new Map<
        string,
        number
      >();

      Object.entries(menstrualSubscriptionDurationObj).forEach(
        ([key, value]) => {
          parseMenstrualSubscriptionDuration.set(
            key,
            this.strToMilisecond(value),
          );
        },
      );

      console.log(Object.fromEntries(parseMenstrualSubscriptionDuration));
      return Object.fromEntries(parseMenstrualSubscriptionDuration);
    } catch (error) {
      console.log(error);
      this.logger.log(
        `parse menstrual subscription env error: ${error.message}`,
      );
      return {};
    }
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
