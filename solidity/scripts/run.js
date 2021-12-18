const main = async () => {

    // Get ABI
    const ProjectJ = await hre.ethers.getContractFactory('ProjectJTest');

    // Attach the proxy address to the ABI
    const projectJ = await ProjectJ.attach('0xe3B72c01DC44d0C6925E776471bFdFd4A1CD7112')
    
    let txn;
    // Change this function to change the payload sent to contract
    // Comment out any functions you don't want to run
    // txn = await projectJ.mint({value: hre.ethers.utils.parseEther('0.01')});
    // console.log(txn)

    txn = await projectJ.governor();
    console.log(txn)

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