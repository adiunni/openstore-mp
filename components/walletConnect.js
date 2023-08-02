import Web3Modal from "web3modal";
import { ethers } from "ethers";

const providerOptions = {
  binancechainwallet: {
    package: true,
  },
};

export async function initWallet() {
  const web3Modal = new Web3Modal({ providerOptions });
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  return signer;
}

export async function connectWallet() {
  const web3Modal = new Web3Modal(process.env.NEXT_PUBLIC_PROJECT_ADDRESS);
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  return provider;
}
