import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SchedulerRegistry } from '@nestjs/schedule';
import { SubstrateService } from '@common/index';
import {
  queryServiceRequestById,
  retrieveUnstakedAmount,
} from '@debionetwork/polkadot-provider';
import { strToMilisecond } from '@common/tools';
import { config } from '../../config';

@Injectable()
export class UnstakedService implements OnModuleInit {
  private logger: Logger = new Logger(UnstakedService.name);
  private isRunning = false;
  private timer: number;
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly subtrateService: SubstrateService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    this.timer = strToMilisecond(
      config.UNSTAKE_TIMER.toString(),
    );
    const unstakeInterval: number = strToMilisecond(
      config.UNSTAKE_INTERVAL.toString(),
    );

    const unstaked = setInterval(async () => {
      await this.handleWaitingUnstaked();
    }, unstakeInterval);
    this.schedulerRegistry.addInterval('unstaked-interval', unstaked);
  }

  async handleWaitingUnstaked() {
    try {
      if (this.isRunning || this.subtrateService.api === undefined) return;

      this.isRunning = true;
      const createRequestService = await this.elasticsearchService.search({
        index: 'create-service-request',
        allow_no_indices: true,
        body: {
          query: {
            match: {
              'request.status': {
                query: 'WaitingForUnstaked',
              },
            },
          },
          sort: [
            {
              'request.unstaked_at.keyword': {
                unmapped_type: 'keyword',
                order: 'asc',
              },
            },
          ],
        },
        from: 0,
        size: 1000,
      });

      const listRequestService = createRequestService.body.hits.hits;
      for (const requestService of listRequestService) {
        if (this.subtrateService.api === undefined) break;

        const requestId = requestService['_source']['request']['hash'];
        const serviceRequestDetail = await queryServiceRequestById(
          this.subtrateService.api as any,
          requestId,
        );

        if (serviceRequestDetail.status === 'Unstaked') {
          await this.elasticsearchService.update({
            index: 'create-service-request',
            id: requestId,
            refresh: 'wait_for',
            body: {
              doc: {
                request: {
                  status: serviceRequestDetail.status,
                  unstaked_at: serviceRequestDetail.unstakedAt,
                },
              },
            },
          });
        } else {
          const timeWaitingUnstaked: string =
            requestService['_source']['request']['unstaked_at'];

          if (!timeWaitingUnstaked) {
            continue;
          }

          const numberTimeWaitingUnstaked = Number(
            timeWaitingUnstaked.replace(/,/gi, ''),
          );

          const timeNext6Days = numberTimeWaitingUnstaked + this.timer;
          const timeNow = new Date().getTime();
          const diffTime = timeNext6Days - timeNow;

          if (diffTime <= 0) {
            await retrieveUnstakedAmount(
              this.subtrateService.api as any,
              this.subtrateService.pair,
              requestId,
            );
          }
        }
      }
    } catch (err) {
      this.logger.error(`unstaked error ${err}`);
    } finally {
      this.isRunning = false;
    }
  }
}
