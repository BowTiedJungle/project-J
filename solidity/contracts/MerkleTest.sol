pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleTest {

    bytes32 private merkleRoot;
    constructor (bytes32 _merkleRoot) {
        merkleRoot = _merkleRoot;
    }

    // Generate the leaf node (just the hash of tokenID concatenated with the account address)
    function _leaf(address account, uint256 tokenId) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(tokenId, account));
    }

    // Verify that a given leaf is in the tree.
    function _verify(bytes32 _leafNode, bytes32[] memory proof) public view returns (bool) {
            return MerkleProof.verify(proof, merkleRoot, _leafNode);
    }

    function verify(
        address account,
        uint256 tokenId,
        bytes32[] calldata proof
    ) public view returns (bool) {
        bool verified = _verify(_leaf(account, tokenId), proof);
        return verified;   
    }
}