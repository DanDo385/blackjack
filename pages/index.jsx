import Head from 'next/head';
import MetaMaskButton from '../components/MetaMaskButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-no-repeat bg-cover bg-center" style={{ backgroundImage: "url('/images/br-eth-green.jpg')" }}>
      <Head>
        <title>Blackjack</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col items-center justify-center h-screen">
        <MetaMaskButton />
      </div>
    </div>
  );
}
