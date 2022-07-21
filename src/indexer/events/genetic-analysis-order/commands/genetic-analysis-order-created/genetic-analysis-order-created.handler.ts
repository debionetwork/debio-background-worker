import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { GeneticAnalysisOrderCreatedCommandIndexer } from './genetic-analysis-order-created.command';

@Injectable()
@CommandHandler(GeneticAnalysisOrderCreatedCommandIndexer)
export class GeneticAnalysisOrderCreatedHandler
  implements ICommandHandler<GeneticAnalysisOrderCreatedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: GeneticAnalysisOrderCreatedCommandIndexer) {
    const { geneticAnalysisOrderModel, blockMetaData } = command;

    const geneticAnalystService = await this.elasticsearchService.search({
      index: 'genetic-analysts-services',
      body: {
        query: {
          match: { _id: geneticAnalysisOrderModel.service_id },
        },
      },
    });

    const geneticAnalyst = await this.elasticsearchService.search({
      index: 'genetic-analysts',
      body: {
        query: {
          match: { _id: geneticAnalysisOrderModel.seller_id },
        },
      },
    });

    let serviceInfo = {};
    let geneticAnalystInfo = {};

    if (geneticAnalystService.body?.hits?.hits.length > 0) {
      serviceInfo =
        geneticAnalystService.body?.hits?.hits[0]._source.info || {};
    }

    if (geneticAnalyst.body?.hits?.hits.length > 0) {
      geneticAnalystInfo =
        geneticAnalyst.body?.hits?.hits[0]._source.info || {};
    }

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
        service_info: serviceInfo,
        genetic_analyst_info: geneticAnalystInfo,
        blockMetaData: blockMetaData,
      },
    });
  }
}
