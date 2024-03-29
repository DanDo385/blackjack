// pages/_app.jsx

import Head from 'next/head';
import '../styles/globals.css';
import Navbar from '../components/Navbar';
import { WalletProvider } from '../contexts/WalletContext'; // Import the provider

function MyApp({ Component, pageProps }) {
  return (
    <WalletProvider> {/* Wrap the app with WalletProvider */}
      <Head>
        <title>Blackjack</title>
      </Head>
      <Navbar />
      <Component {...pageProps} />
    </WalletProvider>
  );
}

export default MyApp;
