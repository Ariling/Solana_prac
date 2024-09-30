'use client';
import React, { useState } from 'react';
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  SendOptions,
  Keypair,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

// Phantom 지갑 타입 정의
interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signAndSendTransaction: (
    transaction: Transaction
  ) => Promise<{ signature: string }>;
  connect: (opts?: {
    onlyIfTrusted: boolean;
  }) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
}

// Window 인터페이스 확장
declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

function TransferTokenBtn() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getProvider = (): PhantomProvider | undefined => {
    if ('solana' in window) {
      const provider = (window as any).solana;
      if (provider.isPhantom) return provider;
    }
  };

  const handleMintAndTransfer = async () => {
    setIsLoading(true);
    const provider = getProvider();

    try {
      if (!provider) throw new Error('No provider found');
      if (!provider.publicKey) throw new Error('Wallet not connected');

      await provider.connect();

      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

      // Airdrop SOL for paying fees
      const airdropSignature = await connection.requestAirdrop(
        provider.publicKey,
        1000000000 // 1 SOL
      );
      await connection.confirmTransaction(airdropSignature);

      // Create a dummy keypair for type compatibility
      const dummyKp = Keypair.generate();

      const mint = await createMint(
        connection,
        {
          publicKey: provider.publicKey,
          secretKey: dummyKp.secretKey,
        },
        provider.publicKey,
        provider.publicKey,
        9
      );

      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        {
          publicKey: provider.publicKey,
          secretKey: dummyKp.secretKey,
        },
        mint,
        provider.publicKey
      );

      await mintTo(
        connection,
        {
          publicKey: provider.publicKey,
          secretKey: dummyKp.secretKey,
        },
        mint,
        fromTokenAccount.address,
        provider.publicKey,
        1000000000 // 1 token
      );

      const transaction = new Transaction().add(
        createTransferInstruction(
          fromTokenAccount.address,
          fromTokenAccount.address, // Sending to the same account for demonstration
          provider.publicKey,
          1000000000, // 1 token
          [],
          TOKEN_PROGRAM_ID
        )
      );

      const blockhash = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash.blockhash;
      transaction.feePayer = provider.publicKey;

      const signed = await provider.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      console.log('Transaction successful with signature:', signature);
      alert('Token minted and transferred successfully!');
    } catch (error) {
      console.error('Detailed error:', error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      alert('Mint and transfer failed. Please check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleMintAndTransfer} disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Token'}
    </button>
  );
}

export default TransferTokenBtn;
