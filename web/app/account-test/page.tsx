import RentCalTest from '@/components/account-test/calculate-rent';
import AccountTest from '@/components/account-test/create-account';
import WalletBalance from '@/components/account-test/get-account-balance';
import PDACreation from '@/components/account-test/PDACreation';
import React from 'react';

const page = () => {
  return (
    <div>
      <h1>Solana Test Page</h1>
      <AccountTest />
      <h1>Solana Rent Exemption Test</h1>
      <RentCalTest />
      {/* <h1>Wallet Balance Test</h1>
      <WalletBalance /> */}
      <h1>Solana PDA Creation Test</h1>
      <PDACreation />
    </div>
  );
};

export default page;
