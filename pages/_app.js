/* eslint-disable @next/next/no-page-custom-font */
import "../styles/globals.css";
import Head from "next/head";
import Navbar from "../components/Navbar";
import WaveFooter from "../components/WaveFooter";
import Footer from "../components/Footer";
import Script from "next/script";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="description" content="Blockchain based NFT application" />
      </Head>
      <Script src="https://code.jquery.com/jquery-3.3.1.js" async />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.6/umd/popper.min.js"
        async
      />
      <Script
        src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js"
        async
      />
      <Navbar />
      <Component {...pageProps} />
      <footer>
        <WaveFooter />
        <Footer />
      </footer>
    </>
  );
}

export default MyApp;
