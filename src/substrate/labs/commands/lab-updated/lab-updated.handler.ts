import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LabUpdatedCommand } from './lab-updated.command';

@Injectable()
@CommandHandler(LabUpdatedCommand)
export class LabUpdatedHandler implements ICommandHandler<LabUpdatedCommand> {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: LabUpdatedCommand) {
    const { labs: lab } = command;
    
    const decoder = new TextDecoder();

    const info = {
      box_public_key: lab.info.boxPublicKey,
      name: decoder.decode(lab.info.name),
      email: decoder.decode(lab.info.email),
      country: decoder.decode(lab.info.country),
      region: decoder.decode(lab.info.region),
      city: decoder.decode(lab.info.city),
      address: decoder.decode(lab.info.address),
      phone_number: decoder.decode(lab.info.phoneNumber),
      website: decoder.decode(lab.info.website),
      latitude: decoder.decode(lab.info.latitude),
      longitude: decoder.decode(lab.info.longitude),
      profile_image: decoder.decode(lab.info.profileImage)
    };

    await this.elasticsearchService.update({
      index: 'labs',
      id: lab.accountId,
      refresh: 'wait_for',
      body: {
        script: {
          lang: 'painless',
          source: `
            ctx._source.account_id = params.account_id;
            ctx._source.certifications = params.certifications;
            ctx._source.info = params.info;
            ctx._source.blockMetaData = params.blockMetaData;
            ctx._source.verification_status = params.verification_status;

            for(int i = 0; i < ctx._source.services.length; i++) {
              ctx._source.services[i].country = params.country;
              ctx._source.services[i].city = params.city;
              ctx._source.services[i].region = params.region;
            }
          `,
          params: {
            account_id: lab.accountId,
            certifications: lab.certifications,
            verification_status: lab.verificationStatus,
            info: info,
            blockMetaData: command.blockMetaData,
            country: decoder.decode(lab.info.country),
            city: decoder.decode(lab.info.city),
            region: decoder.decode(lab.info.region),
          }
        }
      },
    });

    await this.elasticsearchService.updateByQuery({
      index: 'orders',
      ignore_unavailable: true,
      body: {
        query: {
          match: { 
            seller_id: lab.accountId,
          }
        },
        script: {
          source: "ctx._source.lab_info = params.new_lab_info",
          lang: 'painless',
          params: {
            new_lab_info: info
          }
        }
      }
    });
  }
}
