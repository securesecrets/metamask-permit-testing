import {
  catchError,
  Observable,
  of,
  switchMap,
  first,
  defer,
  from,
} from 'rxjs';
import { AccountPermit } from './types';
import { SecretNetworkClient } from 'secretjs';

function createFetchClient<T>(data$: Observable<T>) {
  return data$.pipe(
    switchMap((response) => of(response)),
    first(),
    catchError((err) => {
      throw err;
    }),
  );
}

/**
 * gets the user account data for a bond contract
 */
const msgQuery = (permit: AccountPermit) => ({
  account: {
    permit,
  },
});

const secretNetworkQueryClient = new SecretNetworkClient({
  url: "https://api.pulsar.scrttestnet.com",
  chainId: "pulsar-2",
})

/**
 * observable to query the contract with input of a permit
 */
const permitQuery$ = ({
  permit, 
  contractAddress, 
  codeHash,
}: {
  permit: AccountPermit,
  contractAddress: string,
  codeHash?: string
}) => createFetchClient(defer(
  () => from(secretNetworkQueryClient.query.compute.queryContract({
    contract_address: contractAddress,
    code_hash: codeHash,
    query: msgQuery(permit),
  })),
));

export {
  createFetchClient,
  permitQuery$,
};
