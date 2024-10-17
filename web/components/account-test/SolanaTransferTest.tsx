import React, { useState, useEffect } from 'react';
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from '@solana/web3.js';

const SolanaTransferTest = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window.solana !== 'undefined') {
        try {
          const response = await window.solana.connect();
          setWalletAddress(response.publicKey.toString());
        } catch (err) {
          console.error('Failed to connect to wallet:', err);
        }
      } else {
        setStatus('Phantom wallet not found. Please install it.');
      }
    };
    connectWallet();
  }, []);

  const testTransfer = async () => {
    if (!walletAddress) {
      setStatus('Please connect your wallet first.');
      return;
    }

    try {
      setStatus('Initiating transfer test...');

      const connection = new Connection(
        'https://api.devnet.solana.com',
        'confirmed'
      );
      const programId = new PublicKey('YOUR_PROGRAM_ID_HERE'); // 배포한 프로그램의 ID로 교체

      const fromPubkey = new PublicKey(walletAddress);
      const toPubkey = new PublicKey(walletAddress); // 여기서는 같은 주소로 테스트

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: fromPubkey, isSigner: true, isWritable: true },
          { pubkey: toPubkey, isSigner: false, isWritable: true },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
        ],
        programId,
        data: Buffer.from([]), // 필요한 경우 명령어 데이터 추가
      });

      const transaction = new Transaction().add(instruction);
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      const signedTransaction = await window.solana!.signTransaction(
        transaction
      );
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      await connection.confirmTransaction(signature);

      setStatus(`Test transfer successful. Signature: ${signature}`);
    } catch (error) {
      console.error('Test transfer failed:', error);
      setStatus(`Test transfer failed: ${error}`);
    }
  };

  return (
    <div>
      <h2>Solana Transfer Program Test</h2>
      {walletAddress ? (
        <p>Connected wallet: {walletAddress}</p>
      ) : (
        <p>Please connect your Phantom wallet</p>
      )}
      <button onClick={testTransfer}>Test Transfer</button>
      <p>{status}</p>
    </div>
  );
};

export default SolanaTransferTest;
