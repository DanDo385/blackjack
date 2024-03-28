// pages.index.jsx 
import Head from 'next/head';
import MetaMaskButton from '../components/MetaMaskButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-cover bg-no-repeat" style={{ backgroundImage: "url('/images/br-eth-green.jpg')" }}>
      <Head>
        <title>Blackjack</title>
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-green-400 text-xl">
          Sign In to MetaMask to begin playing blackjack on the Sepolia Test Network
        </h2>
        <MetaMaskButton />
      </main>
    </div>
  );
}
