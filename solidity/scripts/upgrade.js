const { upgrades } = require("hardhat");
const proxyAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'

const main = async () => {
    const TestContract = await hre.ethers.getContractFactory("ProjectJTest");
    const testContract = await upgrades.upgradeProxy(proxyAddress,TestContract);
    console.log('Contract upgraded at: ', testContract);
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