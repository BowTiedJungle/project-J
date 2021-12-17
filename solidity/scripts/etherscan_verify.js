const main = async () => {

    const contractAddress = '0x776B79526490E7Ecc848Ca38dC7cAb0882517797';

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