const { upgrades } = require("hardhat");

const main = async () => {

const gnosisSafe = '0x09657c51c466E78e2a2BaF0232EA78BB9C5DAb3d';
 
console.log("Transferring ownership of ProxyAdmin...");
// The owner of the ProxyAdmin can upgrade our contracts
await upgrades.admin.transferProxyAdminOwnership(gnosisSafe);
console.log("Transferred ownership of ProxyAdmin to:", gnosisSafe);

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