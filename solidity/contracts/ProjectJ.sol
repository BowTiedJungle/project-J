//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

contract ProjectJ is ERC721PresetMinterPauserAutoId {
    // Placeholder, base URI has to be set with this preset OZ contract
    string _baseURI;
    constructor() ERC721("Project J","PRJ",_baseURI) {
    }

    // Declare roles for AccessControl
    bytes32 public constant MODERATOR = keccak256("MODERATOR");

    // Mapping of good standing to allow moderation of access control
    mapping(address => bool) goodStanding = true;

    // Modification of standing will emit target address, the new standing, and the address changing the standing
    event StandingModified(address target, bool newStanding, address changedBy);

    modifier inGoodStanding() {
        require(goodStanding[msg.sender] == true,"Account %s is not in good standing.",msg.sender);
        _;
    }

    // Modify the standing of the target address. Cannot change own standing. Requires moderator role.
    function modifyStanding(address target, bool newStanding) public onlyRole(MODERATOR) {
        require(target != msg.sender,"Moderator cannot modify their own standing.");
        goodStanding[target] = newStanding;
        emit StandingModified(target, newStanding, msg.sender);
    }

}
