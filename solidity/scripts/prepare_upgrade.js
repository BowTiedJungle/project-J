const { upgrades } = require("hardhat");

// Change this to deployment TransparentUpgradeableProxy location
const proxyAddress = '0xe3B72c01DC44d0C6925E776471bFdFd4A1CD7112'

const main = async () => {
    // Change the contract factory to the V2 contract
    const TestContract = await hre.ethers.getContractFactory("ProjectJTest");
    const testContractAddress = await upgrades.prepareUpgrade(proxyAddress,TestContract);
    console.log('New contract deployed at: ', testContractAddress);
}

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();