import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DateTimeProxy,
  NotificationService,
  SubstrateService,
} from '../../../../../common';
import { setGeneticAnalysisOrderFulfilled } from '@debionetwork/polkadot-provider';
import { GeneticAnalysisResultReadyCommand } from './genetic-analysis-result-ready.command';
import { NotificationDto } from '../../../../../common/notification/dto/notification.dto';

@Injectable()
@CommandHandler(GeneticAnalysisResultReadyCommand)
export class GeneticAnalysisResultReadyHandler
  implements ICommandHandler<GeneticAnalysisResultReadyCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalysisResultReadyCommand.name,
  );
  constructor(
    private readonly substrateService: SubstrateService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: GeneticAnalysisResultReadyCommand) {
    const geneticAnalysis = command.geneticAnalysis.normalize();
    const blockNumber = command.blockMetaData.blockNumber.toString();
    this.logger.log(
      `Genetic Analysis Result Ready With Tracking ID: ${geneticAnalysis.geneticAnalysisTrackingId}!`,
    );
    try {
      await setGeneticAnalysisOrderFulfilled(
        this.substrateService.api as any,
        this.substrateService.pair,
        geneticAnalysis.geneticAnalysisOrderId,
      );

      const currDate = this.dateTimeProxy.new();

      const notificationInput: NotificationDto = {
        role: 'Customer',
        entity_type: 'Genetic Analysis Tracking',
        entity: 'Order Fulfilled',
        reference_id: geneticAnalysis.geneticAnalysisOrderId,
        description: `Your Genetic Analysis results for [] are out. Click here to see your order details.`,
        read: false,
        created_at: currDate,
        updated_at: currDate,
        deleted_at: null,
        from: geneticAnalysis.ownerId,
        to: 'Debio Network',
        block_number: blockNumber,
      };

      await this.notificationService.insert(notificationInput);
    } catch (error) {
      this.logger.log(error);
    }
  }
}
