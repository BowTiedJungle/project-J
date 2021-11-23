const { upgrades } = require("hardhat");

const main = async () => {
    // Hardhat generates a deterministic set of testnet addresses for the local dev chain. Txns default to being sent by first one in this context.
    const [tester1, tester2, degen1, degen2, governor] = await hre.ethers.getSigners();
    var moderators = [tester1.address];
    var pausers = [tester1.address];
    var degens = [degen1.address,degen2.address]
    const baseURI = "testURI/";


    const nftContractFactory = await hre.ethers.getContractFactory('ProjectJ');
    const nftContract = await upgrades.deployProxy(nftContractFactory,[moderators,pausers,baseURI,governor.address,degens]);
    await nftContract.deployed();
    console.log("Contract deployed to:", nftContract.address);

};
  
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