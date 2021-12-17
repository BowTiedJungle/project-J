const main = async () => {

    const contractAddress = '0x73c02580bc7A16276Be5d2bA4afD14022312221B';

    await hre.run("verify:verify", {
        address: contractAddress
    });
          
    console.log("Verified.");

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