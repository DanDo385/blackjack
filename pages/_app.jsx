import Head from 'next/head'; // Import the Head component
import '../styles/globals.css';
import Navbar from '../components/Navbar';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Blackjack</title> 
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <div className="md:ml-60">
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;
