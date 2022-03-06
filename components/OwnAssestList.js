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

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function wait(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  const putItemToSell = async (nft, newPrice) => {
    const web3Modal = new Web3Modal(projAddress);
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      NFTMarket.abi,
      signer
    );
    const listingPrice = await marketContract.getListingPrice();
    toast("Opening wallet...");
    console.log(nft);
    await wait(1000);
    try {
      const tx = await marketContract.putItemToResell(
        nftaddress,
        nft.itemId,
        ethers.utils.parseUnits(newPrice, "ether"),
        { value: listingPrice.toString() }
      );
      await tx.wait();
      getItems();
    } catch (error) {
      toast.error("Failed to put item to sell!");
    }
  };

  useEffect(() => {
    getItems();
    setIsLoading(false);
  }, []);

  const getItems = async () => {
    try {
      const web3Modal = new Web3Modal(projAddress);
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const marketContract = new ethers.Contract(
        nftmarketaddress,
        NFTMarket.abi,
        signer
      );
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
      const data = await marketContract.fetchPurchasedNFTs();

      let newItems = await Promise.all(
        data.map(async (d) => {
          const tokenUri = await tokenContract.tokenURI(d.tokenId);
          const meta = await axios.get(tokenUri);
          const price = ethers.utils.formatUnits(d.price.toString(), "ether");
          return {
            price,
            itemId: d.itemId.toNumber(),
            tokenId: d.tokenId.toNumber(),
            seller: d.seller,
            owner: d.owner,
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
            creator: d.creator,
          };
        })
      );
      setItems(newItems);
      toast.success("Items fetched successfully!");
    } catch (e) {
      console.log(e);
      toast.error("Error fetching items!");
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
      <ToastContainer autoClose={3000} />
      {items.length ? (
        items.map((item, key) => (
          <UserCard putItemToSell={putItemToSell} key={key} data={item} />
        ))
      ) : (
        <p style={{ fontSize: "26pt" }}>You do not have any assets for now</p>
      )}
    </div>
  );
};

export default ItemList;
