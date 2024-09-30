'use client';
import TransferButton from '@/components/address/send-sol';
import TransferTokenBtn from '@/components/address/TransferTokenBtn';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useEffect, useState } from 'react';
// import * as bs58 from 'bs58';
// import * as bip39 from 'bip39';
// import nacl from 'tweetnacl';
// import { decodeUTF8 } from 'tweetnacl-util';

export default function Address() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  //   const keypair = Keypair.generate();
  // 검증하는 방법
  //   console.log(PublicKey.isOnCurve(!publicKey?.toBytes()));
  // const mnemonic = bip39.generateMnemonic();
  // const mnemonic =
  //   'pill tomorrow foster begin walnut borrow virtual kick shift mutual shoe scatter';
  // arguments: (mnemonic, password)
  // const seed = bip39.mnemonicToSeedSync(mnemonic, '');
  // const keypair = Keypair.fromSeed(seed.slice(0, 32));
  // console.log(`${keypair.publicKey.toBase58()}`);

  // const keypair = Keypair.fromSecretKey(
  //   Uint8Array.from([
  //     174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
  //     222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
  //     15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
  //     121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
  //   ])
  // );

  // const message = 'The quick brown fox jumps over the lazy dog';
  // const messageBytes = decodeUTF8(message);

  // const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
  // const result = nacl.sign.detached.verify(
  //   messageBytes,
  //   signature,
  //   keypair.publicKey.toBytes()
  // );

  // console.log(result);

  // code for the `getAirdropOnClick` function here
  const getAirdropOnClick = async () => {
    try {
      if (!publicKey) {
        throw new Error('Wallet is not Connected');
      }
      const [latestBlockhash, signature] = await Promise.all([
        connection.getLatestBlockhash(),
        connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL),
      ]);
      const sigResult = await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        'confirmed'
      );
      if (sigResult) {
        alert('Airdrop was confirmed!');
      }
    } catch (err) {
      alert('You are Rate limited for Airdrop');
    }
  };
  // 잔액변경 및 3분마다 업데이트를 하는 것으로 바꿨다. 너무 많은 호출로 429에러가 뜨기 때문
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (publicKey) {
      const getBalance = async () => {
        try {
          const newBalance = await connection.getBalance(publicKey);
          const newBalanceInSol = newBalance / LAMPORTS_PER_SOL;
          setBalance((prevBalance) => {
            // 잔액이 변경되었을 때만 상태 업데이트
            if (prevBalance !== newBalanceInSol) {
              return newBalanceInSol;
            }
            return prevBalance;
          });
        } catch (error) {
          console.error('Failed to fetch balance:', error);
        }
      };

      // 초기 잔액 확인
      getBalance();

      // 3분 마다 잔액 확인
      const REFRESH_INTERVAL = 3 * 60 * 1000; // 3분
      intervalId = setInterval(getBalance, REFRESH_INTERVAL);
    }

    // 정리(cleanup) 함수
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [publicKey, connection]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-evenly p-24">
      {publicKey ? (
        <div className="flex flex-col gap-4">
          <h1>Your Public key is: {publicKey?.toString()}</h1>
          <h2>Your Balance is: {balance} SOL</h2>
          <div>
            <button
              onClick={getAirdropOnClick}
              type="button"
              className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            >
              Get Airdrop
            </button>
            <TransferButton />
          </div>
          <div>Send Token</div>
          <TransferTokenBtn />
        </div>
      ) : (
        <h1>Wallet is not connected</h1>
      )}
    </main>
  );
}
