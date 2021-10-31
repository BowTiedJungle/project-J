//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

contract ProjectJ is ERC721PresetMinterPauserAutoId {
    // Placeholder, base URI has to be set with this preset OZ contract
    string _baseURI;
    constructor() ERC721("Project J","PRJ",_baseURI) {
    }

}
