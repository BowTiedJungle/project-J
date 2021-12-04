const { ethers } = require("hardhat");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

const main = async () => {

    const [addr1,addr2,addr3,addr4] = await hre.ethers.getSigners();

    const whitelist = [
        addr1.address,
        addr2.address,
        addr3.address,
        addr4.address
    ]

    function hashAddress(account) {
        return Buffer.from(ethers.utils.solidityKeccak256(['address'],[account]).slice(2),'hex');
    }

    function generateMerkleTree(wl) {
        const merkleTree = new MerkleTree(
            wl.map(hashAddress),
            keccak256,
            { 
                sortPairs: true,
                sortLeaves: true
            }
        );
        return [merkleTree,merkleTree.getHexRoot()];
    }

    const [merkleTree,deploymentRoot] = generateMerkleTree(whitelist);
    console.log('Root: ',deploymentRoot)
    console.log('Tree:\n',merkleTree.toString())
    const proof1 = merkleTree.getHexProof(hashAddress(addr1.address));
    console.log('Proof1: ',proof1)
    const proof2 = merkleTree.getHexProof(hashAddress(addr2.address));
    console.log('Proof2: ',proof2)

    // Deploy tester contract
    const merkleFactory = await hre.ethers.getContractFactory('MerkleTest');
    const merkleTest = await merkleFactory.deploy(deploymentRoot);
    console.log('Deployed to: ',merkleTest.address);

    // leaves visibly match generated proof aside from the 0x, and are swapped in order for some infernal reason
    const leaf1 = await merkleTest._leaf(addr1.address)
    console.log('Leaf1: ',leaf1)
    const leaf2 = await merkleTest._leaf(addr2.address)
    console.log('Leaf2: ',leaf2)

    // Verify
    var txn = await merkleTest._verify(leaf1,proof1);
    console.log(txn);

    txn = await merkleTest._verify(leaf2,proof2);
    console.log(txn);

    txn = await merkleTest.verify(addr1.address,proof1);
    console.log(txn);

    txn = await merkleTest.verify(addr2.address,proof2);
    console.log(txn);

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