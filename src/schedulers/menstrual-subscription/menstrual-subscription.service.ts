import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SchedulerRegistry } from '@nestjs/schedule';
import { strToMilisecond, SubstrateService } from '@common/index';
import { changeMenstrualSubscriptionStatus } from '@debionetwork/polkadot-provider/lib/command/menstrual-subscription';
import { queryMenstrualSubscriptionById } from '@debionetwork/polkadot-provider/lib/query/menstrual-subscription';
import { SubscriptionStatus } from '@debionetwork/polkadot-provider/lib/primitives/subscription-status';
import { PaymentStatus } from '@debionetwork/polkadot-provider/lib/primitives/payment-status';
import { Duration } from '@debionetwork/polkadot-provider/lib/primitives/duration';
import { config } from 'src/config';

@Injectable()
export class MenstrualSubscriptionService {
  private logger: Logger = new Logger(MenstrualSubscriptionService.name);
  private isRunningInActive = false;
  private menstrualSubscriptionDuration: { [key: string]: number };
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly subtrateService: SubstrateService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const unstakeInterval: number = strToMilisecond(
      config.UNSTAKE_INTERVAL.toString(),
    );

    this.menstrualSubscriptionDuration =
      this.parseMenstrualSubscriptionDuration();

    const menstrualSubscriptionInActive = setInterval(async () => {
      await this.handleInActiveMenstrualSubscription();
    }, unstakeInterval);
    this.schedulerRegistry.addInterval(
      'menstrual-subscription-inactive',
      menstrualSubscriptionInActive,
    );
  }

  async checkActiveMenstrualSubscription(duration: Duration) {
    try {
      const menstrualSubscription = await this.elasticsearchService.search({
        index: 'menstrual-subscription',
        allow_no_indices: true,
        body: {
          query: {
            bool: {
              must: [
                {
                  match: {
                    status: {
                      query: 'Active',
                    },
                  },
                },
                {
                  match: {
                    duration: {
                      query: duration,
                    },
                  },
                },
              ],
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

          await this.checkInQueueByAddress(menstrualSubscriptionData.addressId);
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

          await this.checkInQueueByAddress(menstrualSubscriptionData.addressId);
        }
      }
    } catch (err) {
      this.logger.error(`inactive menstrual subscription error ${err}`);
    }
  }

  async handleInActiveMenstrualSubscription() {
    try {
      if (this.isRunningInActive || this.subtrateService.api === undefined)
        return;

      this.isRunningInActive = true;
      const durations = Object.values(Duration);
      for (const duration of durations) {
        this.checkActiveMenstrualSubscription(duration);
      }
    } catch (err) {
      this.logger.error(`handle inactive menstrual subscription error ${err}`);
    } finally {
      this.isRunningInActive = false;
    }
  }

  async checkInQueueByAddress(address: string) {
    try {
      const menstrualSubscription = await this.elasticsearchService.search({
        index: 'menstrual-subscription',
        allow_no_indices: true,
        body: {
          query: {
            bool: {
              must: [
                {
                  match: {
                    status: {
                      query: 'InQueue',
                    },
                  },
                },
                {
                  match: {
                    address_id: {
                      query: address,
                    },
                  },
                },
              ],
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

        if (
          menstrualSubscriptionData.status === SubscriptionStatus.InQueue &&
          menstrualSubscriptionData.paymentStatus === PaymentStatus.Paid
        ) {
          await changeMenstrualSubscriptionStatus(
            this.subtrateService.api,
            this.subtrateService.pair,
            menstrualSubscriptionId,
            SubscriptionStatus.Active,
          );
          break;
        } else if (
          menstrualSubscriptionData.status === SubscriptionStatus.Active &&
          menstrualSubscriptionData.paymentStatus === PaymentStatus.Paid
        ) {
          await this.elasticsearchService.update({
            index: 'menstrual-subscription',
            id: menstrualSubscriptionId,
            refresh: 'wait_for',
            body: {
              doc: {
                status: SubscriptionStatus.Active,
                payment_status: PaymentStatus.Paid,
              },
            },
          });
          break;
        }
      }
    } catch (err) {
      this.logger.error(`active menstrual subscription error ${err}`);
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
        JSON.parse(config.MENSTRUAL_SUBSCRIPTION_DURATION.toString() ?? '{}');
      const parseMenstrualSubscriptionDuration: Map<string, number> = new Map<
        string,
        number
      >();

      Object.entries(menstrualSubscriptionDurationObj).forEach(
        ([key, value]) => {
          parseMenstrualSubscriptionDuration.set(key, strToMilisecond(value));
        },
      );

      return Object.fromEntries(parseMenstrualSubscriptionDuration);
    } catch (error) {
      console.log(error);
      this.logger.log(
        `parse menstrual subscription env error: ${error.message}`,
      );
      return {};
    }
  }
}
