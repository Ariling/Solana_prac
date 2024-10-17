'use client';
import React, { useState, useEffect } from 'react';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

const SolanaProgram = () => {
  const [status, setStatus] = useState('Initializing...');
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    // 팬텀 계정과 연결 짓는 방법을 알려주는 것!
    const connectWallet = async () => {
      if (typeof window.solana !== 'undefined') {
        try {
          const response = await window.solana.connect();
          setWalletAddress(response.publicKey.toString());
          setStatus('Wallet connected. Ready to run program.');
        } catch (err) {
          console.error('Failed to connect wallet:', err);
          setStatus('Failed to connect wallet. Please try again.');
        }
      } else {
        setStatus('Phantom wallet not found. Please install it.');
      }
    };

    connectWallet();
  }, []);

  const runProgram = async () => {
    if (!walletAddress) {
      setStatus('Please connect your wallet first.');
      return;
    }

    try {
      const programId = new PublicKey(
        '77ezihTV6mTh2Uf3ggwbYF2NyGJJ5HHah1GrdowWJVD3'
      );

      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      // 1SOL 에어드롭 하는 부분이 생략
      // Hello state account
      setStatus('Creating hello state account...');
      const helloAccount = Keypair.generate();

      const accountSpace = 1;
      const rentRequired = await connection.getMinimumBalanceForRentExemption(
        accountSpace
      );

      const allocateHelloAccountIx = SystemProgram.createAccount({
        // 이 부분만 살짝 바뀜
        fromPubkey: new PublicKey(walletAddress),
        newAccountPubkey: helloAccount.publicKey,
        lamports: rentRequired,
        space: accountSpace,
        programId: programId,
      });

      const passClockIx = new TransactionInstruction({
        programId: programId,
        keys: [
          {
            pubkey: new PublicKey(walletAddress),
            isSigner: true,
            isWritable: true,
          },
          {
            pubkey: helloAccount.publicKey,
            isSigner: false,
            isWritable: true,
          },
          // 이게 있냐 없냐의 차이..!
          {
            pubkey: SYSVAR_CLOCK_PUBKEY,
            isSigner: false,
            isWritable: false,
          },
        ],
        // 이게 추가가 되었다
        data: Buffer.alloc(0),
      });
      // 이것도 추가가 되었다.
      setStatus('Preparing transaction...');
      // blockHash와 lastValid는 기존에서 그냥 데려와서 하는 걸로 변경됨
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      const transaction = new Transaction().add(
        allocateHelloAccountIx,
        passClockIx
      );
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(walletAddress);
      // 이거 메소드 활용은 solana내부에 있는 함수로 한 듯
      setStatus('Please approve the transaction in your wallet...');
      const signedTransaction = await window.solana!.signTransaction(
        transaction
      );
      signedTransaction.partialSign(helloAccount);

      setStatus('Sending transaction...');
      // requestAirdrop함수대신에 sendRawTransaction으로 바꾸기
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      setStatus('Confirming transaction...');
      // airdrop 1 SOL
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error('Transaction failed to confirm');
      }

      setStatus(`Transaction succeeded. Signature: ${signature}`);
    } catch (error) {
      console.error('Error:', error);
      setStatus(`Error: ${error}`);
    }
  };

  return (
    <div>
      <h1>Solana Hello Program</h1>
      <p>Status: {status}</p>
      <p>Wallet Address: {walletAddress || 'Not connected'}</p>
      <button onClick={runProgram} disabled={!walletAddress}>
        Run Program
      </button>
    </div>
  );
};

export default SolanaProgram;
