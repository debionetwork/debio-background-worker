import { Orders } from "src/substrate/orders/models/orders";

export class FailedOrderBlockCommand {
	constructor(public readonly blockNumber: number, public readonly order: Orders) {}
}