import Head from 'next/head';
import '../styles/globals.css';
import Navbar from '../components/Navbar';

function MyApp({ Component, pageProps }) {
  const noNavbar = pageProps.noNavbar; 

  return (
    <>
      <Head>
        <title>Blackjack</title> 
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!noNavbar && <Navbar />} 
      <div className={`md:ml-60 ${noNavbar ? '' : 'mt-12'}`}> 
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;
