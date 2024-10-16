'use client';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { useState } from 'react';

const RentCalTest = () => {
  const [rentExemptionAmount, setRentExemptionAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateRentExemption = async () => {
    setLoading(true);
    setError('');
    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const dataLength = 1500; // length of data in bytes
      const amount = await connection.getMinimumBalanceForRentExemption(
        dataLength
      );
      setRentExemptionAmount(amount);
    } catch (err) {
      setError(`${err}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">
        Solana Rent Exemption Calculator
      </h2>
      <button
        onClick={calculateRentExemption}
        className="px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm"
        disabled={loading}
      >
        {loading ? 'Calculating...' : 'Calculate Rent Exemption'}
      </button>
      {rentExemptionAmount !== null && (
        <p className="mt-4">
          Rent Exemption Amount: {rentExemptionAmount} lamports
        </p>
      )}
      {error && <p className="mt-4 text-red-500">Error: {error}</p>}
    </div>
  );
};

export default RentCalTest;
