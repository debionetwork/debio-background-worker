import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SchedulerRegistry } from '@nestjs/schedule';
import { strToMilisecond, SubstrateService } from '@common/index';
import {
  queryGeneticAnalystByAccountId,
  retrieveGeneticAnalystUnstakeAmount,
} from '@debionetwork/polkadot-provider';
import { config } from '../../config';

@Injectable()
export class GeneticAnalystUnstakedService implements OnModuleInit {
  private logger: Logger = new Logger(GeneticAnalystUnstakedService.name);
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
      await this.handleWaitingUnstakedGA();
    }, unstakeInterval);
    this.schedulerRegistry.addInterval('unstaked-ga-interval', unstaked);
  }

  async handleWaitingUnstakedGA() {
    try {
      if (this.isRunning || this.subtrateService.api === undefined) return;

      this.isRunning = true;
      const geneticAnalystsWaitingUnstaked =
        await this.elasticsearchService.search({
          index: 'genetic-analysts',
          allow_no_indices: true,
          body: {
            query: {
              match: {
                stake_status: {
                  query: 'WaitingForUnStaked',
                },
              },
            },
            sort: [
              {
                'unstake_at.keyword': {
                  unmapped_type: 'keyword',
                  order: 'asc',
                },
              },
            ],
          },
          from: 0,
          size: 10,
        });

      const listGeneticAnalyst = geneticAnalystsWaitingUnstaked.body.hits.hits;
      for (const geneticAnalystData of listGeneticAnalyst) {
        if (this.subtrateService.api === undefined) break;

        const requestId = geneticAnalystData['_source']['account_id'];
        const geneticAnalystDetail = await queryGeneticAnalystByAccountId(
          this.subtrateService.api as any,
          requestId,
        );

        if (geneticAnalystDetail.stakeStatus === 'Unstaked') {
          await this.elasticsearchService.update({
            index: 'genetic-analysts',
            id: requestId,
            refresh: 'wait_for',
            body: {
              doc: {
                stake_status: geneticAnalystDetail.stakeStatus,
                unstake_at: geneticAnalystDetail.unstakeAt,
              },
            },
          });
        } else {
          const timeWaitingUnstaked: string =
            geneticAnalystData['_source']['unstake_at'];

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
            await retrieveGeneticAnalystUnstakeAmount(
              this.subtrateService.api as any,
              this.subtrateService.pair,
              requestId,
            );
          }
        }
      }
    } catch (err) {
      this.logger.error(`ga unstaked error ${err}`);
    } finally {
      this.isRunning = false;
    }
  }
}
