const main = async () => {
    const tester2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    const tester1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    var moderators = [tester1,tester2]
    var pausers = [tester1,tester2]

    const nftContractFactory = await hre.ethers.getContractFactory('ProjectJ');
    const nftContract = await nftContractFactory.deploy(moderators,pausers);
    await nftContract.deployed();
    console.log("Contract deployed to:", nftContract.address);

    let txn;
    txn = await nftContract.modifyStanding(tester2,true)
    console.log("Standing modified")

    let standing;
    standing = await nftContract.checkStanding(tester2)
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