import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  transfer,
} from '@solana/spl-token';
import BN from 'bn.js';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Solana devnet에 연결
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    // 1. 토큰 전송 테스트
    const tokenTransferResult = await testTokenTransfer(connection);

    // 2. 계정 생성 테스트
    const createAccountResult = await testCreateAccount(connection);

    return NextResponse.json({
      success: true,
      txHash: `Token Transfer: ${tokenTransferResult}, Create Account: ${createAccountResult}`,
    });
  } catch (error: any) {
    console.error('Error details:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Server issue',
        details: JSON.stringify(error),
      },
      { status: 500 }
    );
  }
}

async function testTokenTransfer(connection: Connection): Promise<string> {
  // 키페어 생성
  const payer = Keypair.generate();
  const recipient = Keypair.generate();

  // SOL 에어드롭
  const airdropSignature = await connection.requestAirdrop(
    payer.publicKey,
    2 * LAMPORTS_PER_SOL // 더 많은 SOL을 요청
  );
  await connection.confirmTransaction(airdropSignature);

  // 토큰 민트 생성
  const mint = await createMint(connection, payer, payer.publicKey, null, 9);

  // 소스 토큰 계정 생성
  const sourceTokenAccount = await createAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );

  // 토큰 발행
  await mintTo(
    connection,
    payer,
    mint,
    sourceTokenAccount,
    payer,
    100 * Math.pow(10, 9)
  );

  // 대상 토큰 계정 생성
  const destinationTokenAccount = await createAccount(
    connection,
    payer,
    mint,
    recipient.publicKey
  );

  // 토큰 전송
  const transferTx = await transfer(
    connection,
    payer,
    sourceTokenAccount,
    destinationTokenAccount,
    payer.publicKey,
    50 * Math.pow(10, 9)
  );

  return transferTx;
}

async function testCreateAccount(connection: Connection): Promise<string> {
  const payer = Keypair.generate();
  const newAccount = Keypair.generate();

  // SOL 에어드롭
  const airdropSignature = await connection.requestAirdrop(
    payer.publicKey,
    2 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(airdropSignature);

  // 계정 생성에 필요한 렌트 계산
  const space = 100;
  const rentExemptionAmount =
    await connection.getMinimumBalanceForRentExemption(space);

  // 계정 생성 트랜잭션
  const createAccountTx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: newAccount.publicKey,
      lamports: rentExemptionAmount,
      space: space,
      programId: SystemProgram.programId,
    })
  );

  // 트랜잭션 전송
  const txHash = await sendAndConfirmTransaction(connection, createAccountTx, [
    payer,
    newAccount,
  ]);

  return txHash;
}
