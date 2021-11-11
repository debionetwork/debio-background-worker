import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LabRegisteredCommand } from './lab-registered.command';
import { decode } from 'punycode';

@Injectable()
@CommandHandler(LabRegisteredCommand)
export class LabRegisteredHandler
  implements ICommandHandler<LabRegisteredCommand>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: LabRegisteredCommand) {
    const decoder = new TextDecoder();

    const { labs: lab } = command;

    await this.elasticsearchService.index({
      index: 'labs',
      refresh: 'wait_for',
      id: lab.accountId,
      body: {
        account_id: lab.accountId,
        services: lab.services,
        certifications: lab.certifications,
        verification_status: lab.verificationStatus,
        info: {
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
        },
        blockMetaData: command.blockMetaData,
      },
    });
  }
}
