'use client';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { useEffect, useState } from 'react';

const WalletBalance = () => {
  const [balance, setBalance] = useState(-1);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        const wallet = new PublicKey(
          'G2FAbFQPFa5qKXCetoFZQEvF9BVvCKbvUZvodpVidnoY'
        );
        const balanceInLamports = await connection.getBalance(wallet);
        setBalance(balanceInLamports / LAMPORTS_PER_SOL);
      } catch (err) {
        setError(`${err}`);
      }
    };
    fetchBalance();
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Solana Wallet Balance</h2>
      {balance !== null ? (
        <p className="text-lg">Balance: {balance.toFixed(9)} SOL</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <p>Loading balance...</p>
      )}
    </div>
  );
};

export default WalletBalance;
