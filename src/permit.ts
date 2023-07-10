import { encodeJsonToB64 } from "./utils";
import { StdSignDoc } from "secretjs/dist/wallet_amino";
import { PermitSignature, AccountPermit } from "./types";

const createSignDoc = (key: string, chainId: string):StdSignDoc => ({
    account_number: '0', // Must be 0
    chain_id: chainId,
    fee: {
      amount: [{
        amount: '0', denom: 'uscrt',
      }], // Must be 0 uscrt
      gas: '1', // Must be 1
    },
    memo: '',
    msgs: [{
      type: 'signature_proof', // Must be "signature_proof"
      value: {
        data: encodeJsonToB64({}),
        key,
      },
    }],
    sequence: '0', // Must be 0
  })

const createAccountPermit = (signature: PermitSignature, key: string, chainId: string): AccountPermit => ({
  params: {
    data: encodeJsonToB64({}),
    key,
  },
  chain_id: chainId,
  signature,
})

export {
  createSignDoc,
  createAccountPermit,
}