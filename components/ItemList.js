import React from "react";
import Web3Modal from "web3modal";
import Card from "./Card";
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
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    getItems(filterCategory);
  }, [filterCategory]);

  useEffect(() => {
    getItems("All");
    setIsLoading(false);
  }, []);

  const getItems = async (category) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_PROJECT_ADDRESS
      );
      await provider.ready;
      const tokenContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_NFT_ADDRESS,
        NFT.abi,
        provider
      );
      const marketContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS,
        NFTMarket.abi,
        provider
      );
      let data;
      if (category == "All") {
        data = await marketContract
          .getMarketItems()
          .catch((err) => toast.error("Failed to get market items!"));
      } else {
        data = await marketContract
          .getItemsByCategory(category)
          .catch((error) => toast.error("Failed to get categorized items!"));
      }
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
            creator: d.creator,
          };
        })
      ).catch((err) => {
        console.log(err);
      });
      setItems(newItems);
      toast.success("Items fetched successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch items");
    }
  };

  async function wait(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  const buyNft = async (nft) => {
    try {
      const web3Modal = new Web3Modal(process.env.NEXT_PUBLIC_PROJECT_ADDRESS);
      const connection = await web3Modal.connect();
      const prov = new ethers.providers.Web3Provider(connection);
      const signer = prov.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS,
        NFTMarket.abi,
        signer
      );

      const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
      toast("Opening wallet...");
      await wait(1000);
      const transaction = await contract
        .createMarketSale(process.env.NEXT_PUBLIC_NFT_ADDRESS, nft.tokenId, {
          value: price.toString(),
        })
        .catch((err) => {
          console.log(err);
          toast.error("Error creating transaction");
        });
      const tx = await transaction.wait();
      toast.success("Successfully purchased item!");
      getItems("All");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <ToastContainer autoClose="2000" />
      <div style={{ width: "200px" }}>
        <label htmlFor="category">Category:</label>{" "}
        <select
          name="category"
          id="category"
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Art">Art</option>
          <option value="Graphics">Graphics</option>
          <option value="Others">Others</option>
        </select>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {!isLoading && items.length > 0 ? (
          items.map((item, key) => (
            <Card key={key} buyNft={buyNft} data={item} />
          ))
        ) : (
          <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>
        )}
      </div>
    </div>
  );
};

export default ItemList;
