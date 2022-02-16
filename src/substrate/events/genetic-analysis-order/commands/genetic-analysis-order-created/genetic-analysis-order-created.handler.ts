import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalysisOrderCreatedCommand } from './genetic-analysis-order-created.command';

@Injectable()
@CommandHandler(GeneticAnalysisOrderCreatedCommand)
export class GeneticAnalysisOrderCreatedHandler
  implements ICommandHandler<GeneticAnalysisOrderCreatedCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalysisOrderCreatedCommand) {
    const { geneticAnalysisOrderModel, blockMetaData } = command;

    await this.elasticsearchService.index({
      index: 'genetic-analysis-order',
      id: geneticAnalysisOrderModel.id,
      refresh: 'wait_for',
      body: {
        id: geneticAnalysisOrderModel.id,
        service_id: geneticAnalysisOrderModel.service_id,
        customer_id: geneticAnalysisOrderModel.customer_id,
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
        created_at: geneticAnalysisOrderModel.created_at,
        updated_at: geneticAnalysisOrderModel.updated_at,
        blockMetaData: blockMetaData,
      },
    });
  }
}
