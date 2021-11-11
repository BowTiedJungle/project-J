const main = async () => {
    // Hardhat generates a deterministic set of testnet addresses for the local dev chain. Txns default to being sent by first one in this context.
    const tester1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const tester2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    var moderators = [tester1,tester2];
    var pausers = [tester1,tester2];
    const baseURI = "testURI";

    const nftContractFactory = await hre.ethers.getContractFactory('ProjectJ');
    const nftContract = await nftContractFactory.deploy(moderators,pausers,baseURI);
    await nftContract.deployed();
    console.log("Contract deployed to:", nftContract.address);



    let txn;
    txn = await nftContract.modifyStanding(tester2,true);
    console.log("Standing modified");

    let standing;
    standing = await nftContract.checkStanding(tester2);
    console.log(standing);

    let mint;
    mint = await nftContract.mint();
    console.log("Minted")

    let balanceOf;
    balanceOf = await nftContract.balanceOf(tester1);
    console.log("Balance of %s address is: %d",tester1,balanceOf);

    let burn;
    burn = await nftContract.burn(0);
    console.log("Burned");
    balanceOf = await nftContract.balanceOf(tester1);
    console.log("Balance of %s address is: %d",tester1,balanceOf);

    // mint = await nftContract.mint(tester2);
    // console.log("Minted")
    // console.log("Balance of %s address is: %d",tester2,balanceOf);
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