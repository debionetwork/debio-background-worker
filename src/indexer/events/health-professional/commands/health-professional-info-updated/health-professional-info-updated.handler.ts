import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { HealthProfessionalInfoUpdatedCommandIndexer } from './health-professional-info-updated.command';

@Injectable()
@CommandHandler(HealthProfessionalInfoUpdatedCommandIndexer)
export class HealthProfessionalInfoUpdatedHandler
  implements ICommandHandler<HealthProfessionalInfoUpdatedCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(
    command: HealthProfessionalInfoUpdatedCommandIndexer,
  ): Promise<any> {
    const {
      accountId,
      healthProfessionalInfo: {
        anonymous,
        box_public_key,
        category,
        date_of_birth,
        email,
        first_name,
        gender,
        last_name,
        myriad_username,
        phone_number,
        profile_image,
        profile_link,
        role,
      },
      blockMetaData,
    } = command;

    await this.elasticsearchService.update({
      id: accountId,
      index: 'health-professional',
      refresh: 'wait_for',
      body: {
        doc: {
          info: {
            anonymous: anonymous,
            box_public_key: box_public_key,
            category: category,
            date_of_birth: date_of_birth,
            email: email,
            first_name: first_name,
            gender: gender,
            last_name: last_name,
            myriad_username: myriad_username,
            phone_number: phone_number,
            profile_image: profile_image,
            profile_link: profile_link,
            role: role,
          },
          blockMetaData: blockMetaData,
        },
      },
    });
  }
}
