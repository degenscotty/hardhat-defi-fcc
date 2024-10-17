const { getNamedAccounts, ethers, network } = require("hardhat")
const { getWeth, AMOUNT } = require("../scripts/getWeth")
const { networkConfig } = require("../helper-hardhat-config")

async function main() {
    // the protocol treats everything as an ERC20 token
    await getWeth()
    const { deployer } = await getNamedAccounts()
    // abi, contract

    // Lending Pool Address Provider: 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
    // Lending Pool: ^
    const lendingPool = await getLendingPool(deployer)
    console.log(`LendingPool Address is: ${lendingPool.address}`)

    // deposit
    const wethTokenAddress = networkConfig[network.config.chainId]["wethToken"]
    // approve
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)
    console.log("Depositing..")
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("Deposited!")

    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer)
    // Borrow Time!

    const daiPrice = await getDaiPrice()
    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.5 * (1 / daiPrice.toNumber())
    console.log(`You can borrow ${amountDaiToBorrow} DAI`)
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString())
    console.log(`You can borrow ${amountDaiToBorrowWei} DAI in WEI`)

    const daiToken = networkConfig[network.config.chainId]["daiToken"]
    await borrowDai(daiToken, lendingPool, amountDaiToBorrowWei, deployer)
    console.log("done")

    await getBorrowUserData(lendingPool, deployer)
}

async function borrowDai(daiAddress, lendingPool, amountDaiToBorrowWei, account) {
    const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrowWei, 1, 0, account)
    await borrowTx.wait(1)
    console.log("Youve borrowed!")
}

async function getDaiPrice(account) {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        networkConfig[network.config.chainId]["daiEthPriceFeed"]
    )
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH price is ${price.toString()}`)
    return price
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account)
    console.log(`You have ${ethers.utils.formatEther(totalCollateralETH)} worth of ETH deposited.`)
    console.log(`You have ${ethers.utils.formatEther(totalDebtETH)} worth of ETH borrowed.`)
    console.log(`You can borrow ${ethers.utils.formatEther(availableBorrowsETH)} worth of ETH.`)
    return { availableBorrowsETH, totalDebtETH }
}

async function approveErc20(erc20Address, spenderAddress, amountToSpend, account) {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account)
    const tx = await erc20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("Appproved!")
}

async function getLendingPool(account) {
    const lendingPoolAddressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        networkConfig[network.config.chainId]["lendingPoolAddressesProvider"],
        account
    )
    const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    return lendingPool
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
