const { ethers } = require("hardhat")

const networkConfig = {
    11155111: {
        name: "sepolia",
    },
    4002: {
        name: "fantom_testnet",
    },
    80002: {
        name: "amoy",
    },
    31337: {
        name: "hardhat",
        wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        lendingPoolAddressesProvider: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        daiEthPriceFeed: "0x773616E4d11A78F511299002da57A0a94577F1f4",
        daiToken: "0x6b175474e89094c44da98b954eedeac495271d0f",
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}
