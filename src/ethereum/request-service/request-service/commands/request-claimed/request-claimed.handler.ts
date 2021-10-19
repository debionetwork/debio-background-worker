import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { RequestClaimedCommand } from "./request-claimed.command";

@Injectable()
@CommandHandler(RequestClaimedCommand)
export class RequestClaimedHandler implements ICommandHandler<RequestClaimedCommand> {
    constructor(private readonly elasticSearchService: ElasticsearchService) {}

    async execute(command: RequestClaimedCommand) {
        await this.elasticSearchService.update({
            index: 'create-service-request',
            id: command.request.hash,
            body: {
                doc: {
                    request: command.request,
                    blockMetadata: command.blockMetadata,
                }
            }
        })
    }
}