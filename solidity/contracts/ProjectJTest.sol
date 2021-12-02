//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ProjectJTest is 
    ERC721Upgradeable,
    ERC721BurnableUpgradeable,
    ERC721PausableUpgradeable,
    AccessControlEnumerableUpgradeable
{

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdTracker;

    // Declare roles for AccessControl
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    string private _baseTokenURI;

    address payable public governor;

    uint256 public constant mintPrice = 0.1 ether;

    mapping(address => bool) public freeMintEligible;

    function initialize(
        address[] memory _moderators,
        address[] memory _pausers,
        string memory baseTokenURI,
        address payable _governor,
        address[] memory _freeMintEligible
    ) initializer public payable {

        __ERC721_init("ProjectJ","PRJ");

        // Set contract governor
        governor = _governor;
        _setupRole(GOVERNOR_ROLE, _governor);

        // Set base token URI
        _baseTokenURI = baseTokenURI;

        // Initialize default admin role
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

        // Initialize moderators
        uint256 i;
        for (i = 0;i < _moderators.length; i++) {
            _setupRole(MODERATOR_ROLE,_moderators[i]);
        }

        // Initialize pausers
        for (i = 0;i < _pausers.length; i++) {
            _setupRole(PAUSER_ROLE,_pausers[i]);
        }

        // Initialize degenimals whitelist
        for (i = 0;i < _freeMintEligible.length; i++) {
            freeMintEligible[_freeMintEligible[i]] = true;
        }

        // Increment counter so first mint starts at token #1
        _tokenIdTracker.increment();
    }

    // Mapping of blacklisted accounts to allow deactivation of NFTs
    mapping(address => bool) public blacklist;

    // Modification of standing will emit target address, the new standing, and the address changing the standing
    event StandingModified(address target, bool newStanding, address changedBy);

    // Requires target address to be in good standing
    modifier inGoodStanding() {
        require(blacklist[msg.sender] == false,"Account is blacklisted.");
        _;
    }

    modifier onePerWallet() {
        require(balanceOf(msg.sender) == 0,"One per customer ser");
        _;
    }

    modifier eligible() {
        require(freeMintEligible[msg.sender] == true,"Not eligible for free mint");
        _;
    }

    /**
     * Overrides OZ ERC721 _baseURI as per design intent of the library function
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function updateBaseURI(string memory _newURI) public onlyRole(GOVERNOR_ROLE) {
        _baseTokenURI = _newURI;
    }

    /**
     * @dev Pauses all token transfers.
     *
     * See {ERC721Pausable} and {Pausable-_pause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function pause() public virtual {
        require(hasRole(PAUSER_ROLE, _msgSender()), "ERC721PresetMinterPauserAutoId: must have pauser role to pause");
        _pause();
    }

    /**
     * @dev Unpauses all token transfers.
     *
     * See {ERC721Pausable} and {Pausable-_unpause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function unpause() public virtual {
        require(hasRole(PAUSER_ROLE, _msgSender()), "ERC721PresetMinterPauserAutoId: must have pauser role to unpause");
        _unpause();
    }

    // Modify the standing of the target address. Cannot change own standing. Requires moderator role. Requires good standing.
    function modifyStanding(address target, bool newStanding) inGoodStanding onlyRole(MODERATOR_ROLE) public {
        require(target != msg.sender,"User cannot modify their own standing.");
        blacklist[target] = newStanding;
        emit StandingModified(target, newStanding, msg.sender);
    }

    // Return standing of target address.
    function checkStanding(address _address) public view returns (bool) {
        return blacklist[_address];
    }

    // Mint NFT. Requires the sender to be in good standing and not possess a pass already.
    function mint() public payable inGoodStanding onePerWallet {
        require(msg.value == mintPrice,"Mint price not correct");
        _safeMint(msg.sender, _tokenIdTracker.current());
        _tokenIdTracker.increment();
    }

    function mintFree() public inGoodStanding onePerWallet eligible {
        freeMintEligible[msg.sender] = false;
        _safeMint(msg.sender, _tokenIdTracker.current());
        _tokenIdTracker.increment();
    }

    // Withdraw contract balance
    function withdraw() public onlyRole(GOVERNOR_ROLE) {
        require(msg.sender == governor,"Only contract governor can withdraw funds.");
        governor.transfer(address(this).balance);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerableUpgradeable, ERC721Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // This hook has to be here for compatability
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721Upgradeable, ERC721PausableUpgradeable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function proxyTest() public view returns (uint256) {
        return 42;
    }

}
