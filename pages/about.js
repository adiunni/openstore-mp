import Team from "../components/Team";
import Head from "next/head";

export default function About() {
  return (
    <>
      <Head>
        <title>NFTX | About</title>
        <meta
          name="description"
          content="Your simple NFT application (previously known as OpenStore)"
        />
      </Head>
      <Team />
    </>
  );
}
