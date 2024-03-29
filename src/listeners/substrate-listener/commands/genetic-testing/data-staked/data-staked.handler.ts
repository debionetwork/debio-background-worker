import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DebioConversionService,
  TransactionLoggingService,
  SubstrateService,
} from '@common/index';
import {
  convertToDbioUnitString,
  queryOrderDetailByOrderID,
  sendRewards,
} from '@debionetwork/polkadot-provider';
import { DataStakedCommand } from './data-staked.command';
import { TransactionLoggingDto } from '@common/transaction-logging/dto/transaction-logging.dto';
import { TransactionTypeList } from '@common/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '@common/transaction-status/models/transaction-status.list';

@Injectable()
@CommandHandler(DataStakedCommand)
export class DataStakedHandler implements ICommandHandler<DataStakedCommand> {
  private readonly logger: Logger = new Logger(DataStakedCommand.name);
  constructor(
    private readonly transactionLoggingService: TransactionLoggingService,
    private readonly exchangeCacheService: DebioConversionService,
    private readonly substrateService: SubstrateService,
  ) {}

  async execute(command: DataStakedCommand) {
    try {
      const dataStaked = command.dataStaked;

      this.logger.log(
        `Data Staked With Hash Data Bounty: ${dataStaked.hashDataBounty}!`,
      );
      const dataOrder = await queryOrderDetailByOrderID(
        this.substrateService.api as any,
        dataStaked.orderId,
      );

      const totalPrice = dataOrder.prices.reduce(
        (acc, price) => acc + +price.value,
        0,
      );
      const totalAdditionalPrice = dataOrder.additionalPrices.reduce(
        (acc, price) => acc + +price.value,
        0,
      );
      const amountToForward = totalPrice + totalAdditionalPrice;

      const exchange = await this.exchangeCacheService.getExchange();
      const dbioToDai = exchange ? exchange['dbioToDai'] : 1;
      const debioToDai = Number(dbioToDai);

      const rewardPrice = amountToForward / debioToDai;

      //send reward
      await sendRewards(
        this.substrateService.api as any,
        this.substrateService.pair,
        dataOrder.customerId,
        Math.floor(+convertToDbioUnitString(rewardPrice)).toString(),
      );

      // Write Transaction Logging Reward Customer Staking Request Service
      const dataCustomerLoggingInput: TransactionLoggingDto = {
        address: dataOrder.customerId,
        amount: rewardPrice,
        created_at: new Date(),
        currency: 'DBIO',
        parent_id: BigInt(0),
        ref_number: dataOrder.id,
        transaction_type: TransactionTypeList.Reward,
        transaction_status: TransactionStatusList.CustomerAddDataAsBounty,
      };
      await this.transactionLoggingService.create(dataCustomerLoggingInput);
    } catch (err) {
      this.logger.log(
        `Event listener catch error ${err.name}, ${err.message}, ${err.stack}`,
      );
    }
  }
}
