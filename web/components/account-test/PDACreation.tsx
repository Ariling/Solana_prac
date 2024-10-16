'use client';
import React, { useState } from 'react';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  PublicKey,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
  SYSVAR_RENT_PUBKEY,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

const PDACreation = () => {
  const [result, setResult] = useState('');

  const createPDA = async () => {
    try {
      const programId = new PublicKey(
        '8NzKevcrv9YWWyA6vr6epBmKpSWrj41oeH1fAJFfxGmn'
      );
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

      const feePayer = Keypair.generate();
      const feePayerAirdropSignature = await connection.requestAirdrop(
        feePayer.publicKey,
        LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(feePayerAirdropSignature);

      let [pda, bump] = await PublicKey.findProgramAddress(
        [feePayer.publicKey.toBuffer()],
        programId
      );
      setResult(`bump: ${bump}, pubkey: ${pda.toBase58()}`);

      const data_size = 0;

      let instruction = new TransactionInstruction({
        keys: [
          { pubkey: feePayer.publicKey, isSigner: true, isWritable: true },
          { pubkey: pda, isSigner: false, isWritable: true },
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
        ],
        programId: programId,
        data: Buffer.from(new Uint8Array([data_size, bump])),
      });

      let tx = new Transaction().add(instruction);

      // Simulate transaction
      const latestBlockhash = await connection.getLatestBlockhash();
      const simulationResult = await connection.simulateTransaction(
        tx,
        [feePayer],
        latestBlockhash
      );
      console.log('Simulation result:', simulationResult);

      if (simulationResult.value.err) {
        throw new Error(
          `Simulation failed: ${JSON.stringify(simulationResult.value.err)}`
        );
      }

      // If simulation succeeds, send the actual transaction
      const txid = await sendAndConfirmTransaction(connection, tx, [feePayer]);
      setResult(
        (prevResult) =>
          `${prevResult}\nTransaction successful. Signature: ${txid}`
      );
    } catch (error) {
      console.error('Error:', error);
      if (error.logs) {
        console.error('Transaction logs:', error.logs);
      }
      setResult(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <button onClick={createPDA}>Create PDA</button>
      <pre>{result}</pre>
    </div>
  );
};

export default PDACreation;
