import { ApiPromise } from "@polkadot/api";

export async function callSendRewards(
  api: ApiPromise,
  pair: any,
  substrateAddress: string,
  rewardAmount: string,
) {
  // tslint:disable-next-line
  await api.tx.rewards
    .rewardFunds(substrateAddress, rewardAmount)
    .signAndSend(pair, { nonce: -1 });
}