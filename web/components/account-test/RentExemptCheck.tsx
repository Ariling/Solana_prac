'use client';
import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const RentExemptCheck = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [rentExemptStatus, setRentExemptStatus] = useState('');

  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window.solana !== 'undefined') {
        try {
          const response = await window.solana.connect();
          setWalletAddress(response.publicKey.toString());
        } catch (err) {
          console.error('Failed to connect wallet:', err);
        }
      } else {
        console.error('Phantom wallet not found');
      }
    };

    connectWallet();
  }, []);

  const checkRentExemptStatus = async () => {
    if (!walletAddress) {
      console.error('Wallet not connected');
      return;
    }

    const connection = new Connection(
      'https://api.devnet.solana.com',
      'confirmed'
    );
    const publicKey = new PublicKey(walletAddress);

    try {
      const accountInfo = await connection.getAccountInfo(publicKey);
      if (!accountInfo) {
        setRentExemptStatus('Account not found');
        return;
      }

      const rentExemptionAmount =
        await connection.getMinimumBalanceForRentExemption(
          accountInfo.data.length
        );
      const isRentExempt = accountInfo.lamports >= rentExemptionAmount;

      setRentExemptStatus(`
        Account balance: ${accountInfo.lamports / LAMPORTS_PER_SOL} SOL
        Rent exemption amount: ${rentExemptionAmount / LAMPORTS_PER_SOL} SOL
        Is rent exempt: ${isRentExempt ? 'Yes' : 'No'}
      `);
    } catch (error) {
      console.error('Error checking rent exempt status:', error);
      setRentExemptStatus('Error checking rent exempt status');
    }
  };

  return (
    <div>
      <h2>Rent-Exempt Status Check</h2>
      {walletAddress ? (
        <p>Connected Wallet: {walletAddress}</p>
      ) : (
        <p>Please connect your Phantom wallet</p>
      )}
      <button onClick={checkRentExemptStatus} disabled={!walletAddress}>
        Check Rent-Exempt Status
      </button>
      {rentExemptStatus && <pre>{rentExemptStatus}</pre>}
    </div>
  );
};

export default RentExemptCheck;
