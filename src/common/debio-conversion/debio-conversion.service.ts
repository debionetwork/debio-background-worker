import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { config } from 'src/config';

@Injectable()
export class DebioConversionService {
  private readonly logger: Logger = new Logger(DebioConversionService.name);

  async getExchange() {
    try {
      const res = await axios.get(
        `${config.REDIS_STORE_URL.toString()}/cache`,
        {
          auth: {
            username: config.REDIS_STORE_USERNAME.toString(),
            password: config.REDIS_PASSWORD.toString(),
          },
        },
      );

      return res.data;
    } catch (error) {
      this.logger.log(`API conversion": ${error.message}`);
    }
  }

  async getExchangeFromTo(from: string, to: string) {
    try {
      const res = await axios.get(
        `${config.REDIS_STORE_URL.toString()}/cache`,
        {
          params: {
            from,
            to,
          },
          auth: {
            username: config.REDIS_STORE_USERNAME.toString(),
            password: config.REDIS_PASSWORD.toString(),
          },
        },
      );

      return res.data;
    } catch (error) {
      this.logger.log(`API conversion": ${error.message}`);
    }
  }
}
