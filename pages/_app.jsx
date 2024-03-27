// pages/_app.jsx
import '../styles/globals.css';
import Navbar from '../components/Navbar';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <div className="md:ml-60">
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;
