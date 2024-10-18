'use client';
import { useEffect, useState } from 'react';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

export default function PDACreate() {
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    const runSolanaTest = async () => {
      try {
        const PAYER_KEYPAIR = Keypair.generate();

        const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
        console.log('Connection endpoint:', connection.rpcEndpoint);

        // Test connection
        try {
          const version = await connection.getVersion();
          console.log('Solana version:', version);
        } catch (error) {
          console.error('Error connecting to local validator:', error);
          return;
        }

        console.log(
          `Requesting airdrop for ${PAYER_KEYPAIR.publicKey.toBase58()}`
        );
        const airdropSignature = await connection.requestAirdrop(
          PAYER_KEYPAIR.publicKey,
          LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(airdropSignature);

        const balance = await connection.getBalance(PAYER_KEYPAIR.publicKey);
        console.log(`Account balance: ${balance / LAMPORTS_PER_SOL} SOL`);

        const programId = new PublicKey(
          'B2aF8VVwrVx8yAWAXq9XQLenRAYYVLihXj6qd4cw5yfG'
        );
        console.log('Program ID:', programId.toBase58());

        try {
          console.log('Fetching program info...');
          const programInfo = await connection.getAccountInfo(
            programId,
            'confirmed'
          );
          console.log('Raw program info:', programInfo);

          if (programInfo) {
            console.log('Program found:');
            console.log('  Owner:', programInfo.owner.toBase58());
            console.log('  Data length:', programInfo.data.length);
            console.log('  Is executable:', programInfo.executable);
          } else {
            console.log('Program not found. This is unexpected.');
          }
        } catch (error) {
          console.error('Error fetching program info:', error);
        }

        // Test with System Program
        try {
          const systemProgramInfo = await connection.getAccountInfo(
            SystemProgram.programId,
            'confirmed'
          );
          console.log('System program info:', systemProgramInfo);
        } catch (error) {
          console.error('Error fetching system program info:', error);
        }

        // Get current slot
        try {
          const slotInfo = await connection.getSlot();
          console.log('Current slot:', slotInfo);
        } catch (error) {
          console.error('Error getting slot info:', error);
        }

        const [pda, bump] = await PublicKey.findProgramAddress(
          [Buffer.from('customaddress'), PAYER_KEYPAIR.publicKey.toBuffer()],
          programId
        );

        console.log(`PDA Pubkey: ${pda.toString()}`);

        const createPDAIx = new TransactionInstruction({
          programId: programId,
          data: Buffer.from(Uint8Array.of(bump)),
          keys: [
            {
              isSigner: true,
              isWritable: true,
              pubkey: PAYER_KEYPAIR.publicKey,
            },
            {
              isSigner: false,
              isWritable: true,
              pubkey: pda,
            },
            {
              isSigner: false,
              isWritable: false,
              pubkey: SystemProgram.programId,
            },
          ],
        });

        // PDA 생성 부분 바로 위에 다음 코드를 추가합니다.
        const recentBlockhash = await connection.getRecentBlockhash();

        const transaction = new Transaction({
          feePayer: PAYER_KEYPAIR.publicKey,
          recentBlockhash: recentBlockhash.blockhash,
        }).add(createPDAIx);

        // 트랜잭션에 서명합니다.
        transaction.sign(PAYER_KEYPAIR);
        transaction.add(createPDAIx);

        // Log transaction details before sending
        console.log('Transaction before sending:', transaction);

        const txHash = await sendAndConfirmTransaction(
          connection,
          transaction,
          [PAYER_KEYPAIR]
        );
        setResult(`Created PDA successfully. Tx Hash: ${txHash}`);
      } catch (error) {
        console.error('Error in runSolanaTest:', error);
        if (error instanceof Error) {
          setResult(`Error: ${error.message}`);
        } else {
          setResult(`An unknown error occurred`);
        }
      }
    };

    runSolanaTest();
  }, []);

  return (
    <div>
      <h1>Solana Test Result</h1>
      <p>{result}</p>
    </div>
  );
}
