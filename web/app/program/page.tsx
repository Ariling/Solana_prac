import RentExemptCheck from '@/components/account-test/RentExemptCheck';
import SolanaProgram from '@/components/account-test/SolanaProgram';

const page = () => {
  return (
    <div>
      <h1>Solana Program Test</h1>
      <SolanaProgram />
      <h1>Rent-Exempt Test</h1>
      <RentExemptCheck />
    </div>
  );
};

export default page;
