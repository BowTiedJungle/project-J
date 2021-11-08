const main = async () => {
    const nftContractFactory = await hre.ethers.getContractFactory('ProjectJ');
    const nftContract = await nftContractFactory.deploy();
    await nftContract.deployed();
    console.log("Contract deployed to:", nftContract.address);

    const tester1 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    const tester2 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    let txn;
    txn = await nftContract.modifyStanding(tester1,true)
    console.log("Standing modified")

    let standing;
    standing = await nftContract.checkStanding(tester1)
    console.log(standing)
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