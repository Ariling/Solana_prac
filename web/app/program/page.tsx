'use client';
import { useEffect, useState } from 'react';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

declare global {
  interface Window {
    solana?: any;
  }
}

export default function Home() {
  const [walletKey, setWalletKey] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  // Phantom 지갑 연결
  const connectWallet = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          const response = await solana.connect();
          const publicKey = response.publicKey.toString();
          setWalletKey(publicKey);
          setStatus('지갑이 연결되었습니다: ' + publicKey);
        }
      } else {
        setStatus('Phantom 지갑을 설치해주세요!');
      }
    } catch (error) {
      console.error(error);
      setStatus('지갑 연결 중 오류가 발생했습니다.');
    }
  };

  // SOL 전송 테스트
  const handleTransferTest = async () => {
    try {
      if (!window.solana || !walletKey) {
        setStatus('지갑을 먼저 연결해주세요!');
        return;
      }

      // Devnet 연결
      const connection = new Connection(
        'https://api.devnet.solana.com',
        'confirmed'
      );

      // 임의의 수신자 주소 (테스트용)
      const recipientPubKey = new PublicKey(
        'FZNzUVqt2pM5v5A6xhBaGZQwXDpGBbv8n1QzyzBGcTGE'
      );

      // 전송할 금액 (0.1 SOL)
      const transferAmount = 0.1 * LAMPORTS_PER_SOL;

      // 트랜잭션 생성
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(walletKey),
          toPubkey: recipientPubKey,
          lamports: transferAmount,
        })
      );

      // 최근 블록해시 가져오기
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(walletKey);

      // 트랜잭션 서명 요청
      const signed = await window.solana.signTransaction(transaction);

      // 트랜잭션 전송
      const signature = await connection.sendRawTransaction(signed.serialize());

      // 트랜잭션 확인
      await connection.confirmTransaction(signature);

      setStatus('전송 완료! 트랜잭션 서명: ' + signature);
    } catch (error: any) {
      console.error(error);
      setStatus('전송 중 오류 발생: ' + error.message);
    }
  };

  // 토큰 계정 생성 테스트
  const handleCreateAccountTest = async () => {
    try {
      if (!window.solana || !walletKey) {
        setStatus('지갑을 먼저 연결해주세요!');
        return;
      }

      // Devnet 연결
      const connection = new Connection(
        'https://api.devnet.solana.com',
        'confirmed'
      );

      // 새 계정을 위한 최소 렌트 비용 계산
      const space = 100; // 계정 크기
      const rentExemptionAmount =
        await connection.getMinimumBalanceForRentExemption(space);

      // 새 계정의 PublicKey 생성
      const newAccountPubkey = new PublicKey(
        'FZNzUVqt2pM5v5A6xhBaGZQwXDpGBbv8n1QzyzBGcTGE'
      ); // 테스트용 주소

      // 계정 생성 트랜잭션
      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: new PublicKey(walletKey),
          newAccountPubkey: newAccountPubkey,
          lamports: rentExemptionAmount,
          space: space,
          programId: SystemProgram.programId,
        })
      );

      // 최근 블록해시 가져오기
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(walletKey);

      // 트랜잭션 서명 요청
      const signed = await window.solana.signTransaction(transaction);

      // 트랜잭션 전송
      const signature = await connection.sendRawTransaction(signed.serialize());

      // 트랜잭션 확인
      await connection.confirmTransaction(signature);

      setStatus('계정 생성 완료! 트랜잭션 서명: ' + signature);
    } catch (error: any) {
      console.error(error);
      setStatus('계정 생성 중 오류 발생: ' + error.message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Solana Phantom 테스트</h1>

      {!walletKey ? (
        <button
          onClick={connectWallet}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Phantom 지갑 연결
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">연결된 지갑: {walletKey}</p>

          <button
            onClick={handleTransferTest}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
          >
            SOL 전송 테스트
          </button>

          <button
            onClick={handleCreateAccountTest}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            계정 생성 테스트
          </button>
        </div>
      )}

      {status && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-sm">{status}</p>
        </div>
      )}
    </div>
  );
}

// return (
//   <div>
//     <h1>Solana Program Test</h1>
//     <SolanaProgram />
//     <h1>Rent-Exempt Test</h1>
//     <RentExemptCheck />
//   </div>
// );
