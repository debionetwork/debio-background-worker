import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalysisOrderRefundedCommand } from './genetic-analysis-order-refunded.command';

@Injectable()
@CommandHandler(GeneticAnalysisOrderRefundedCommand)
export class GeneticAnalysisOrderRefundedHandler
  implements ICommandHandler<GeneticAnalysisOrderRefundedCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalysisOrderRefundedCommand) {
    const { geneticAnalysisOrderModel, blockMetaData } = command;

    await this.elasticsearchService.update({
      index: 'genetic-analysis-order',
      id: geneticAnalysisOrderModel.id,
      refresh: 'wait_for',
      body: {
        doc: {
          customer_box_public_key:
            geneticAnalysisOrderModel.customer_box_public_key,
          seller_id: geneticAnalysisOrderModel.seller_id,
          genetic_analysis_tracking_id:
            geneticAnalysisOrderModel.genetic_analysis_tracking_id,
          currency: geneticAnalysisOrderModel.currency,
          prices: geneticAnalysisOrderModel.prices,
          additional_prices: geneticAnalysisOrderModel.additional_prices,
          status: geneticAnalysisOrderModel.status,
          updated_at: geneticAnalysisOrderModel.updated_at,
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
