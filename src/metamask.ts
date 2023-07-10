import {
  defer,
  from,
  first,
  fromEvent,
  map,
  tap,
  switchMap,
} from 'rxjs';
import { createFetchClient } from '@/services';
import { MetaMaskWallet } from 'secretjs';
import { WalletSigner } from '@/types';
import { StdSignDoc } from 'secretjs/dist/wallet_amino';

/**
 * Gets metamask from the browser window api
 */
function getMetamask() {
  if (window.ethereum === undefined) {
    throw new Error('metamask not available');
  }
  return window.ethereum;
}

/**
 * Checks if metamask exists in the browser
 */
const isMetamaskAvailable = () => window.ethereum !== undefined;

/**
 * Fetch observable for requesting access to metamask accounts
 */
const requestMetamaskAccounts$ = () => createFetchClient(defer(
  () => from(getMetamask().request({ method: 'eth_requestAccounts' })),
)).pipe(
  map((accounts) => accounts[0]),
  first(),
);

/**
 * Fetch observable for getting the account information from the metamask wallet
 */
const getMetamaskAccounts$ = () => createFetchClient(defer(
  () => from(getMetamask().request({ method: 'eth_accounts' })),
)).pipe(
  tap((data) => console.log(data)),
  map((accounts) => accounts[0]),
  first(),
);

/**
 * Fetch observable for getting the chainId from the metamask wallet
 */
const getMetamaskChainId$ = () => createFetchClient(defer(
  () => from(getMetamask().request({ method: 'eth_chainId' })),
)).pipe(
  first(),
);

/**
 * Observable that watches for changes to the metamask wallet account
 */
// @ts-ignore fromEvent doesn't like Eip1193Provider
const metamaskAccountChange$ = () => fromEvent(getMetamask(), 'accountsChanged');

/**
 * Observable that watches for changes to the metamask wallet chain
 * window.location.reload() is the recommended method of handling metamask chain changes
 */
// @ts-ignore fromEvent doesn't like Eip1193Provider
const metamaskChainChange$ = () => fromEvent(getMetamask(), 'chainChainged').pipe(
  tap(() => window.location.reload()),
);

/**
 * Fetch observable for getting the account information from the keplr wallet
 */
const getMetamaskSecretSigner$ = (
  ethAddress: string,
) => {
  const metamask = getMetamask();
  return createFetchClient(defer(
    () => from(MetaMaskWallet.create(metamask, ethAddress)),
  ));
};

/**
 * Sets up the metamask wallet signer observable
 */
const getMetamaskSecretWalletSigner$ = () => getMetamaskAccounts$()
  .pipe(
    tap((data) => console.log(data)),
    switchMap(getMetamaskSecretSigner$),
    map((metaMaskWallet) => {
      const walletSigner: WalletSigner = {
        signer: metaMaskWallet,
      };
      return walletSigner;
    }),
    first(),
  );

/**
 * Sets up the metamask wallet signer observable
 */
const getMetamaskSecretAddress$ = () => getMetamaskAccounts$()
  .pipe(
    switchMap(getMetamaskSecretSigner$),
    map((metaMaskWallet) => metaMaskWallet.address),
    first(),
  );


const signAminoPermitWithMetamask$ = (
  signDoc: StdSignDoc,
) => getMetamaskAccounts$()
  .pipe(
    switchMap(getMetamaskSecretSigner$),
    switchMap((metaMaskWallet) => createFetchClient(defer(() => from(
      metaMaskWallet.signAmino(metaMaskWallet.address, signDoc),
    )))),
    first(),
  );


const signEthSignPermitWithMetamask$ = (
  signDoc: StdSignDoc,
) => getMetamaskAccounts$()
  .pipe(
    switchMap(getMetamaskSecretSigner$),
    switchMap((metaMaskWallet) => createFetchClient(defer(() => from(
      metaMaskWallet.signPermit(metaMaskWallet.address, signDoc),
    )))),
    first(),
  );

export {
  getMetamask,
  requestMetamaskAccounts$,
  getMetamaskAccounts$,
  getMetamaskChainId$,
  metamaskAccountChange$,
  metamaskChainChange$,
  getMetamaskSecretWalletSigner$,
  getMetamaskSecretAddress$,
  signAminoPermitWithMetamask$,
  signEthSignPermitWithMetamask$,
  isMetamaskAvailable,
};
