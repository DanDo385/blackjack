// pages/_app.jsx

import Head from 'next/head'; // Import the Head component
import '../styles/globals.css';
import Navbar from '../components/Navbar';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Blackjack</title> // Set a default title for all pages
        <link rel="icon" href="/favicon.ico" /> // Include the favicon
      </Head>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
