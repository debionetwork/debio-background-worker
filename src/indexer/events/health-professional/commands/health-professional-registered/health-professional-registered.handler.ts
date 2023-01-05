import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { HealthProfessionalRegisteredCommandIndexer } from './health-professional-registered.command';

@Injectable()
@CommandHandler(HealthProfessionalRegisteredCommandIndexer)
export class HealthProfessionalRegisteredHandler
  implements ICommandHandler<HealthProfessionalRegisteredCommandIndexer>
{
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(
    command: HealthProfessionalRegisteredCommandIndexer,
  ): Promise<any> {
    const {
      accountId,
      healthProfessional: {
        account_id,
        availability_status,
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
        qualifications,
        unstaked_at,
        stake_amount,
        stake_status,
        verification_status,
      },
      blockMetaData,
    } = command;

    await this.elasticsearchService.create({
      id: accountId,
      index: 'health-professional',
      refresh: 'wait_for',
      body: {
        account_id: account_id,
        availability_status: availability_status,
        info: {
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
        qualifications: qualifications,
        unstaked_at: unstaked_at,
        stake_amount: stake_amount,
        stake_status: stake_status,
        verification_status: verification_status,
        blockMetaData: blockMetaData,
      },
    });
  }
}
