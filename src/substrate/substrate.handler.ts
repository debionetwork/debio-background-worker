import types from '../../types.json';
import { CommandBus } from '@nestjs/cqrs';
import { Controller } from '@nestjs/common';  
import { ApiPromise, WsProvider } from '@polkadot/api';
import {
  Injectable,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { 
    LabRegisteredCommand,
    LabUpdatedCommand,
    LabDeregisteredCommand
} from './labs';
import { 
    ServiceCreatedCommand,
    ServiceUpdatedCommand,
    ServiceDeletedCommand
} from './services';

const eventRoutes = {
  labs: {
    LabRegistered: LabRegisteredCommand,
    LabUpdated: LabUpdatedCommand,
    LabDeregistered: LabDeregisteredCommand,
  },
  services: {
    ServiceCreated: ServiceCreatedCommand,
    ServiceUpdated: ServiceUpdatedCommand,
    ServiceDeleted: ServiceDeletedCommand,
  }
}

@Injectable()
export class SubstrateService implements OnModuleInit {
  private api: ApiPromise;
  private readonly logger: Logger = new Logger(SubstrateService.name);
  constructor(private commandBus: CommandBus) {}

  async onModuleInit() {
    const wsProvider = new WsProvider(process.env.SUBSTRATE_URL);
    this.api = await ApiPromise.create({
      provider: wsProvider,
      types: types,
    });
  }

  listenToEvents() {
    this.api.query.system.events((events) => {
      events.forEach((record) => {
        const { event } = record;
        const eventSection = eventRoutes[event.section]
        if(eventSection) {
          const eventMethod = new eventSection[event.method]();
          eventMethod[event.section] = event.data[0];
          this.commandBus.execute(eventMethod);
        }
      });
    });
  }
}

@Controller('substrate')
export class SubstrateController {
  substrateService: SubstrateService;
  constructor(substrateService: SubstrateService) {
    this.substrateService = substrateService;
  }

  async onApplicationBootstrap() {
    this.substrateService.listenToEvents();
  }
}