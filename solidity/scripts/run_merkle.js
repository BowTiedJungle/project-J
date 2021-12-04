const { ethers } = require("hardhat");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

const main = async () => {

    const [addr1,addr2,addr3,addr4] = await hre.ethers.getSigners();

    // Map tokenID to wallets
    // e.g.
    const tokens = {
        1: addr1.address,
        2: addr2.address,
        3: addr3.address,
        4: addr4.address
    }

    function hashToken(tokenId, account) {
        return Buffer.from(ethers.utils.solidityKeccak256(["uint256", "address"], [tokenId, account]).slice(2), "hex");
    }

    function generateMerkleTree() {
        const merkleTree = new MerkleTree(
            Object.entries(tokens).map((token) => hashToken(...token)),
            keccak256,
            { 
                sortPairs: true,
                sortLeaves: true
            }
        );
        return [merkleTree,merkleTree.getHexRoot()];
    }

    const [merkleTree,deploymentRoot] = generateMerkleTree();
    console.log('Root: ',deploymentRoot)
    console.log('Tree:\n',merkleTree.toString())
    const proof1 = merkleTree.getHexProof(hashToken(1,addr1.address));
    console.log('Proof1: ',proof1)
    const proof2 = merkleTree.getHexProof(hashToken(2,addr2.address));
    console.log('Proof2: ',proof2)

    // Deploy tester contract
    const merkleFactory = await hre.ethers.getContractFactory('MerkleTest');
    const merkleTest = await merkleFactory.deploy(deploymentRoot);
    console.log('Deployed to: ',merkleTest.address);

    // leaves visibly match generated proof aside from the 0x, and are swapped in order for some infernal reason
    const leaf1 = await merkleTest._leaf(addr1.address,1)
    console.log('Leaf1: ',leaf1)
    const leaf2 = await merkleTest._leaf(addr2.address,2)
    console.log('Leaf2: ',leaf2)

    // Doesn't verify successfully yet
    var txn = await merkleTest._verify(leaf1,proof1);
    console.log(txn);

    txn = await merkleTest._verify(leaf2,proof2);
    console.log(txn);

    txn = await merkleTest.verify(addr1.address,1,proof1);
    console.log(txn);

    txn = await merkleTest.verify(addr2.address,2,proof2);
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