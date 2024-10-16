'use client';
import React, { useState } from 'react';
import {
  SystemProgram,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

const AccountTest = () => {
  const [result, setResult] = useState('');

  const createAccount = async () => {
    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const fromPubkey = Keypair.generate();

      // Airdrop SOL for transferring lamports to the created account
      const airdropSignature = await connection.requestAirdrop(
        fromPubkey.publicKey,
        LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdropSignature);

      // amount of space to reserve for the account
      const space = 0;
      // Seed the created account with lamports for rent exemption
      const rentExemptionAmount =
        await connection.getMinimumBalanceForRentExemption(space);

      const newAccountPubkey = Keypair.generate();
      const createAccountParams = {
        fromPubkey: fromPubkey.publicKey,
        newAccountPubkey: newAccountPubkey.publicKey,
        lamports: rentExemptionAmount,
        space,
        programId: SystemProgram.programId,
      };

      const createAccountTransaction = new Transaction().add(
        SystemProgram.createAccount(createAccountParams)
      );

      const signature = await sendAndConfirmTransaction(
        connection,
        createAccountTransaction,
        [fromPubkey, newAccountPubkey]
      );

      setResult(`Account created successfully! Signature: ${signature}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  return (
    <div>
      <h1>Solana Account Test</h1>
      <button onClick={createAccount}>Create Account</button>
      <p>{result}</p>
    </div>
  );
};

export default AccountTest;
