import { ICommandHandler } from "@nestjs/cqrs";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { RequestStatus } from "../../models/requestStatus";
import { UnstakedServiceRequestCommand } from "./unstaked-service-request.command";

export class UnstakedServiceRequestHandler implements ICommandHandler<UnstakedServiceRequestCommand> {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async execute(command: UnstakedServiceRequestCommand) {
    await this.elasticsearchService.update({
      index: 'create-service-request',
      id: command.request.hash,
      refresh: 'wait_for',
      body: {
        doc: {
          request: {
            request_status: RequestStatus.Unstaked,
            updated_at: command.request.updated_at,
            unstaked_at: command.request.unstaked_at,
          }
        }
      }
    })
  }
}