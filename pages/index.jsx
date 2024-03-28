import Head from 'next/head';
import '../styles/globals.css';
import Navbar from '../components/Navbar';

function MyApp({ Component, pageProps }) {
  const noNavbar = pageProps.noNavbar; // Add a prop to control the display of the Navbar

  return (
    <>
      <Head>
        <title>Blackjack</title> 
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!noNavbar && <Navbar />} {/* Conditionally render the Navbar based on the prop */}
      <div className={`md:ml-60 ${noNavbar ? '' : 'mt-12'}`}> {/* Adjust top margin when Navbar is not present */}
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;
