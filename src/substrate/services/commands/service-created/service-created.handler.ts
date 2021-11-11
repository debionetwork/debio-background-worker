import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceCreatedCommand } from './service-created.command';
import { PriceByCurrency } from '../../models/price-by-currency';
import { Price } from '../../models/price';

@Injectable()
@CommandHandler(ServiceCreatedCommand)
export class ServiceCreatedHandler
  implements ICommandHandler<ServiceCreatedCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: ServiceCreatedCommand) {
    const { services: service } = command;
    
    const decoder = new TextDecoder();

    const resp = await this.elasticsearchService.search({
      index: 'labs',
      body: {
        query: {
          match: { _id: service.ownerId.toString() },
        },
      },
    });

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

    let serviceBody = {
      id: service.id,
      owner_id: service.ownerId,
      info: {
        name: decoder.decode(service.info.name),
        prices_by_currency: prices_by_currency,
        expected_duration: service.info.expectedDuration,
        category: decoder.decode(service.info.category),
        description: decoder.decode(service.info.description),
        dna_collection_process: decoder.decode(service.info.dnaCollectionProcess),
        test_result_sample: decoder.decode(service.info.testResultSample),
        long_description: decoder.decode(service.info.longDescription),
        image: decoder.decode(service.info.image)
      },
      country: '',
      city: '',
      region: '',
      blockMetaData: command.blockMetaData,
      service_flow: command.services.serviceFlow,
    };

    try {
      const { _source } = resp.body.hits.hits[0];
      const { info } = _source;
      const { country, city, region } = info;
      serviceBody = {
        ...serviceBody,
        country,
        city,
        region
      };

      await this.elasticsearchService.index({
        index: 'services',
        id: service.id,
        refresh: 'wait_for',
        body: {
          ...serviceBody,
        },
      });

      await this.elasticsearchService.update({
        index: 'labs',
        id: service.ownerId,
        refresh: 'wait_for',
        body: {
          script: {
            lang: 'painless',
            source: 'ctx._source.services.add(params);',
            params: {
              ...serviceBody,
            },
          },
        },
      });
    } catch (err) {
      console.log("[this.elasticsearchService.update({index: 'labs', })]", err);
    }
  }
}
