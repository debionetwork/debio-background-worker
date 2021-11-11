import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceUpdatedCommand } from './service-updated.command';
import { PriceByCurrency } from '../../models/price-by-currency';
import { Price } from '../../models/price';

@Injectable()
@CommandHandler(ServiceUpdatedCommand)
export class ServiceUpdatedHandler
  implements ICommandHandler<ServiceUpdatedCommand>
{
  private readonly logger: Logger = new Logger(ServiceUpdatedHandler.name);
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: ServiceUpdatedCommand) {
    const { services: service } = command;
    
    const decoder = new TextDecoder();

    const prices_by_currency = [];

    for (let index = 0; index < service.info.pricesByCurrency.length; index++) {
      const pbc = {
        currency: "",
        total_price: 0,
        price_components: [],
        additional_prices: []
      };
      const currpbc : PriceByCurrency = service.info.pricesByCurrency[index];
      pbc.currency = currpbc.currency;
      pbc.total_price = currpbc.totalPrice;
      for (let sindex = 0; sindex < currpbc.priceComponents.length; sindex++) {
        const currprice: Price = currpbc.priceComponents[sindex];

        pbc.price_components.push({
          component: decoder.decode(currprice.component),
          value: currprice.value
        });
      }

      for (let sindex = 0; sindex < currpbc.priceComponents.length; sindex++) {
        const currprice: Price = currpbc.additionalPrices[sindex];
        
        pbc.additional_prices.push({
          component: decoder.decode(currprice.component),
          value: currprice.value
        });
      }
      prices_by_currency.push(prices_by_currency);
    }

    const info = {
      name: decoder.decode(service.info.name),
      prices_by_currency: prices_by_currency,
      expected_duration: service.info.expectedDuration,
      category: decoder.decode(service.info.category),
      description: decoder.decode(service.info.description),
      dna_collection_process: decoder.decode(service.info.dnaCollectionProcess),
      test_result_sample: decoder.decode(service.info.testResultSample),
      long_description: decoder.decode(service.info.longDescription),
      image: decoder.decode(service.info.image)
    }

    await this.elasticsearchService.update({
      index: 'services',
      id: service.id.toString(),
      refresh: 'wait_for',
      body: {
        doc: {
          id: service.id,
          owner_id: service.ownerId,
          info: info,
          service_flow: service.serviceFlow,
          blockMetaData: command.blockMetaData,
        },
      },
    });

    let serviceBody = {
      id: service.id,
      owner_id: service.ownerId,
      info: info,
      service_flow: service.serviceFlow,
      country: '',
      city: '',
      region: '',
    };

    let serviceIndexToDelete = -1;
    try {
      const resp = await this.elasticsearchService.search({
        index: 'labs',
        body: {
          query: {
            match: { _id: service.ownerId.toString() },
          },
        },
      });
      const { _source } = resp.body.hits.hits[0];
      const { info } = _source;
      const { country, city, region } = info;

      serviceIndexToDelete = _source.services.findIndex(
        (s) => s.id == service.id.toString(),
      );
      
      serviceBody = {
        ...serviceBody,
        country,
        city,
        region
      };
    } catch (err) {
      this.logger.log('elasticsearchService.search labs error :', err);
    }

    try {
      await this.elasticsearchService.update({
        index: 'labs',
        id: service.ownerId.toString(),
        refresh: 'wait_for',
        body: {
          script: {
            lang: 'painless',
            source: 'ctx._source.services[params.index] = params.service;',
            params: {
              index: serviceIndexToDelete,
              service: serviceBody
            },
          },
        },
      });
    } catch (err) {
      this.logger.log('elasticsearchService.update labs error', err);
    }

    await this.elasticsearchService.updateByQuery({
      index: 'orders',
      ignore_unavailable: true,
      body: {
        script: {
          source: `ctx._source.service_info = params.new_service_info`,
          lang: 'painless',
          params: {
            new_service_info: service.info
          }
        },
        query: {
          match: { 
            service_id: service.id.toString(),
          }
        },
      }
    });
  }
}
