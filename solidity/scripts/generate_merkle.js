const { ethers } = require("hardhat");
const { keccak256 } = require("keccak256");
const { MerkleTree } = require("merkletreejs");

const main = async () => {

    const [addr1,addr2] = await hre.ethers.getSigners();

    // Map tokenID to wallets
    // e.g.
    const tokens = {
    1: addr1.address,
    2: addr2.address
    }

    function hashToken(tokenId, account) {
        return Buffer.from(ethers.utils.solidityKeccak256(["uint256", "address"], [tokenId, account]).slice(2), "hex");
    }

    function generateMerkleTree() {
        const merkleTree = new MerkleTree(
            Object.entries(tokens).map((token) => hashToken(...token)),
            keccak256,
            { sortPairs: true }
        );
        console.log(merkleTree.getHexRoot())
        return merkleTree;
    }

    generateMerkleTree()
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