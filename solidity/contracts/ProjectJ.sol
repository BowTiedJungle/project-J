//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract ProjectJ is ERC721 {

    // Declare roles for AccessControl
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    constructor() ERC721("ProjectJ","PRJ") {}

    // Mapping of good standing to allow moderation of access control
    mapping(address => bool) public blacklist;

    // Modification of standing will emit target address, the new standing, and the address changing the standing
    event StandingModified(address target, bool newStanding, address changedBy);

    modifier inGoodStanding() {
        require(blacklist[msg.sender] == false,"Account is blacklisted.");
        _;
    }

    // Modify the standing of the target address. Cannot change own standing. Requires moderator role.
    function modifyStanding(address target, bool newStanding) inGoodStanding public {
        require(target != msg.sender,"User cannot modify their own standing.");
        blacklist[target] = newStanding;
        emit StandingModified(target, newStanding, msg.sender);
    }

    function checkStanding(address _address) public view returns (bool) {
        return blacklist[_address];
    }

}
