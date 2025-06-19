// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import CounterIDL from '../target/idl/journal.json'
import type { Journal } from '../target/types/journal'

// Re-export the generated IDL and type
export { Journal, CounterIDL }

// The programId is imported from the program IDL.
export const COUNTER_PROGRAM_ID = new PublicKey(CounterIDL.address)

// This is a helper function to get the Journal Anchor program.
export function getCounterProgram(provider: AnchorProvider, address?: PublicKey): Program<Journal> {
  return new Program({ ...CounterIDL, address: address ? address.toBase58() : CounterIDL.address } as Journal, provider)
}

// This is a helper function to get the program ID for the Journal program depending on the cluster.
export function getCounterProgramId(cluster: Cluster) {
  console.log("cluster: ", cluster);
  console.log(COUNTER_PROGRAM_ID.toBase58());
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Journal program on devnet and testnet.
      return new PublicKey('CcZL6ZukdvR2KTUxGttsjD9tDWtUk5oLBphpL8nyLdP5')
    case 'mainnet-beta':
    default:
      return COUNTER_PROGRAM_ID
  }
}
