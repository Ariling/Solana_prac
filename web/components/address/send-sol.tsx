'use client';
import React, { useState } from 'react';
import {
  Connection,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

function TransferButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async () => {
    setIsLoading(true);
    try {
      const fromKeypair = Keypair.generate();
      const toKeypair = Keypair.generate();

      const connection = new Connection(
        'https://api.devnet.solana.com',
        'confirmed'
      );

      const airdropSignature = await connection.requestAirdrop(
        fromKeypair.publicKey,
        LAMPORTS_PER_SOL
      );

      await connection.confirmTransaction(airdropSignature);

      const lamportsToSend = 1_000_000;

      const transferTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: toKeypair.publicKey,
          lamports: lamportsToSend,
        })
      );

      await sendAndConfirmTransaction(connection, transferTransaction, [
        fromKeypair,
      ]);

      alert('Transfer successful!');
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Transfer failed. Please check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className=" border-black border-2"
      onClick={handleTransfer}
      disabled={isLoading}
    >
      {isLoading ? 'Processing...' : 'Transfer SOL'}
    </button>
  );
}

export default TransferButton;
