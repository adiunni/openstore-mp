import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import Image from "next/image";
import Web3Modal from "web3modal";
import Script from "next/script";
import Head from "next/head";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { initWallet } from "../components/walletConnect";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

import { nftaddress, nftmarketaddress, projAddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function CreateItem() {
  const [values, setValues] = useState({
    price: "",
    name: "",
    category: "",
    fileUrl: null,
    description: "",
  });
  const router = useRouter();
  const success = () =>
    toast.success("Created NFT!", {
      postition: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
    });
  const error = () =>
    toast.error("Error creating NFT!", {
      postition: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
    });
  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const fileUrl = `https://ipfs.infura.io/ipfs/${added.path}`;
      setValues({ ...values, fileUrl });
      toast.success("File uploaded to IPFS!");
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  async function createMarket() {
    const { name, description, price, fileUrl, category } = values;
    if (!name) {
      toast.warn("Please enter a name!");
      return;
    }
    if (!description) {
      toast.warn("Please enter a description!");
      return;
    }
    if (!price || price <= 0) {
      toast.warn("Price cannot be 0 or less!");
      return;
    }
    if (!category) {
      toast.warn("Enter a category!");
      return;
    }
    if (!fileUrl) {
      toast.warn("Please upload an image!");
      return;
    }
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
      toast.error("Error uploading file!");
    }
  }

  async function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function createSale(url) {
    const signer = await initWallet();

    /* next, create the item */
    try {
      let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
      toast("Opening your wallet...");
      await wait(1000);
      let transaction = await contract.createToken(url);
      let tx = await transaction.wait();
      let event = tx.events[0];
      let value = event.args[2];
      let tokenId = value.toNumber();
      const price = ethers.utils.parseUnits(values.price, "ether");

      /* then list the item for sale on the marketplace */
      contract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer);
      let listingPrice = await contract.getListingPrice();
      listingPrice = listingPrice.toString();

      transaction = await contract
        .createMarketItem(nftaddress, tokenId, price, values.category, {
          value: listingPrice,
        })
        .catch((error) => {
          error();
        });
      await transaction.wait();
      success();
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      console.log(error);
      error();
    }
  }

  const handleChange = (e) => {
    setValues((prevValues) => {
      return {
        ...prevValues,
        [e.target.name]: e.target.value,
      };
    });
  };

  return (
    <>
      <Script src="https://kit.fontawesome.com/a076d05399.js" />
      <Head>
        <title>Create Asset</title>
      </Head>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
      />
      <main>
        <h1 className="text-center my-5 header display-4">Create Asset</h1>
        <div style={{ marginBottom: "50px" }} className="container ">
          <div className="row ">
            <div
              className="col-sm-6 block-to-disappear-in-mobile "
              style={{ padding: "30px" }}
            >
              <Image
                src="https://res.cloudinary.com/dnv3ztqf1/image/upload/v1632635884/devathon/create-asset_nvz7xi.svg"
                layout="fill"
                alt="image htmlFor add doctor"
              />
            </div>
            <div className="col-sm-6">
              <for action="/adddoctor" method="POST" className="form-group">
                <input
                  type="hidden"
                  name="csrfmiddlewaretoken"
                  value="fIwiR9rbZTmvxfmW8gC8CiS93Zx36iAh0kdWjuhKGglTMld96xGITqBEbdBR4EkY"
                />
                <ul className="unordered-list">
                  <li>
                    <label htmlFor="id_name">Asset Name:</label>{" "}
                    <input
                      type="text"
                      name="name"
                      placeholder="Asset Name"
                      maxLength="500"
                      required
                      onChange={handleChange}
                      id="id_name"
                    />
                  </li>
                  <li>
                    <label htmlFor="id_description">Asset Description</label>{" "}
                    <textarea
                      type="text"
                      name="description"
                      style={{ height: "20vh", resize: "none" }}
                      maxLength="500"
                      placeholder="Describe your asset in 500 or less characters"
                      required
                      onChange={handleChange}
                      id="id_description"
                    />
                  </li>
                  <li>
                    <label htmlFor="id_price_in_eth">Asset price in ETH:</label>{" "}
                    <input
                      type="number"
                      name="price"
                      required
                      onChange={handleChange}
                      id="id_price_in_eth"
                    />
                  </li>
                  <li>
                    <label htmlFor="id_image">Asset Image:</label>{" "}
                    <input
                      type="file"
                      accept="image/*"
                      name="Asset"
                      className="my-4"
                      onChange={onChange}
                    />
                  </li>
                </ul>
                <div style={{ width: "100%" }}>
                  <div className="text-center">
                    {values.fileUrl && (
                      <Image
                        src={values.fileUrl}
                        width="350"
                        height="250"
                        alt="Product image"
                        objectFit="cover"
                      />
                    )}
                  </div>
                </div>
                <label htmlFor="category">Category:</label>{" "}
                <select name="category" id="category" onChange={handleChange}>
                  <option value="">Select a category</option>
                  <option value="Art">Art</option>
                  <option value="Graphics">Graphics</option>
                  <option value="Others">Others</option>
                </select>
                <button
                  onClick={createMarket}
                  className="btn mt-5 btn-block commonbutton5"
                  type="submit"
                >
                  Submit
                </button>
              </for>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
