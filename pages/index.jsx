import Head from 'next/head';
import MetaMaskButton from '../components/MetaMaskButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-cover bg-no-repeat bg-center" style={{ backgroundImage: "url('/images/br-eth-green.jpg')" }}>
      <Head>
        <title>Blackjack</title>
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-orange-500 text-xl text-center font-bold">
          Sign In to Begin Playing Blackjack on the Sepolia Test Network
        </h2>
        <MetaMaskButton />
      </main>
    </div>
  );
}
