// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import SolanaTestIDL from '../target/idl/solana_test.json';
import type { SolanaTest } from '../target/types/solana_test';

// Re-export the generated IDL and type
export { SolanaTest, SolanaTestIDL };

// The programId is imported from the program IDL.
export const SOLANA_TEST_PROGRAM_ID = new PublicKey(SolanaTestIDL.address);

// This is a helper function to get the SolanaTest Anchor program.
export function getSolanaTestProgram(provider: AnchorProvider) {
  return new Program(SolanaTestIDL as SolanaTest, provider);
}

// This is a helper function to get the program ID for the SolanaTest program depending on the cluster.
export function getSolanaTestProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return SOLANA_TEST_PROGRAM_ID;
  }
}
