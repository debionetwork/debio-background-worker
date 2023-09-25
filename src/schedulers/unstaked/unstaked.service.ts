import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SchedulerRegistry } from '@nestjs/schedule';
import { SubstrateService } from '@common/index';
import {
  queryServiceRequestById,
  retrieveUnstakedAmount,
} from '@debionetwork/polkadot-provider';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { keyList } from '@common/secrets';
import { strToMilisecond } from '@common/tools';

@Injectable()
export class UnstakedService implements OnModuleInit {
  private logger: Logger = new Logger(UnstakedService.name);
  private isRunning = false;
  private timer: number;
  constructor(
    private readonly gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly subtrateService: SubstrateService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    this.timer = strToMilisecond(
      this.gCloudSecretManagerService.getSecret('UNSTAKE_TIMER').toString(),
    );
    const unstakeInterval: number = strToMilisecond(
      this.gCloudSecretManagerService.getSecret('UNSTAKE_INTERVAL').toString(),
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
        } 
      }
    } catch (err) {
      this.logger.error(`unstaked error ${err}`);
    } finally {
      this.isRunning = false;
    }
  }
}
