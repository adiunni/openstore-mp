import React from "react";
import Web3Modal from "web3modal";
import { nftaddress, nftmarketaddress, projAddress } from "../config";
import UserCard from "./UserCard";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { connectWallet } from "./walletConnect";

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getItems();
    setIsLoading(false);
  }, []);

  const getItems = async () => {
    try {
      const provider = await connectWallet();
      const signer = provider.getSigner();
      const marketContract = new ethers.Contract(
        nftmarketaddress,
        NFTMarket.abi,
        signer
      );
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
      const data = await marketContract.fetchCreateNFTs();
      let newItems = await Promise.all(
        data.map(async (d) => {
          const tokenUri = await tokenContract.tokenURI(d.tokenId);
          const meta = await axios.get(tokenUri);
          const price = ethers.utils.formatUnits(d.price.toString(), "ether");
          return {
            price,
            tokenId: d.tokenId.toNumber(),
            seller: d.seller,
            owner: d.owner,
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
          };
        })
      );
      setItems(newItems);
      toast.success("Items fetched successfully!");
    } catch (error) {
      toast.error("Failed to get your items!");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      <ToastContainer autoClose={2000} />
      {items.length ? (
        items.map((item, key) => (
          <UserCard isCreatorDashboard={true} key={key} data={item} />
        ))
      ) : (
        <p style={{ fontSize: "14pt" }}> No items </p>
      )}
    </div>
  );
};

export default ItemList;
