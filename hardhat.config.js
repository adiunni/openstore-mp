require("@nomiclabs/hardhat-waffle");
const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY || "";
const infuraId = process.env.NEXT_PUBLIC_INFURA_ID || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      // Infura
      url: `https://polygon-mumbai.infura.io/v3/${infuraId}`,
      accounts: [privateKey],
    },
    sepolia: {
      // Infura
      url: `https://sepolia.infura.io/v3/${infuraId}`,
      accounts: [privateKey],
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
