import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Portis from "@portis/web3";
import Authereum from "authereum";

const providerOptions = {
  walletConnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "cfc0ba400dcf4a2ca14edff9f68620fd",
    },
  },
  binancechainwallet: {
    package: true,
  },
  portis: {
    package: Portis,
    options: {
      id: "5f8b9b7c-d8f9-4b7b-b8f4-f8f9f8b9b7c5",
    },
  },
  authereum: {
    package: Authereum,
  },
};

export async function initWallet() {
  const web3Modal = new Web3Modal({ providerOptions });
  const provider = await web3Modal.connect();
  const signer = provider.getSigner();
  return signer;
}
