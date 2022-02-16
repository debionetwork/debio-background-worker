import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalysisOrderPaidCommand } from './genetic-analysis-order-paid.command';

@Injectable()
@CommandHandler(GeneticAnalysisOrderPaidCommand)
export class GeneticAnalysisOrderPaidHandler
  implements ICommandHandler<GeneticAnalysisOrderPaidCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalysisOrderPaidCommand) {
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
          genetic_data_id: geneticAnalysisOrderModel.genetic_data_id,
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
