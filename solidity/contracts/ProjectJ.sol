//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract ProjectJ is 
    ERC721Upgradeable,
    ERC721BurnableUpgradeable,
    ERC721PausableUpgradeable,
    AccessControlEnumerableUpgradeable
{

    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _tokenIdTracker;

    // Declare roles for AccessControl
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Base string used in token URI generation
    string private _baseTokenURI;

    // Contract governor address
    // LOCAL TESTING ONLY!! DO NOT FORGET TO CHANGE BEFORE DEPLOYMENT!!
    address payable public constant governor = payable(0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc);

    // Mint price for paid mint
    uint256 public constant mintPrice = 0.1 ether;

    // Maps address to the ability to mint for free
    mapping(address => bool) public freeMintEligible;

    /**
     * @dev Initializer function for OpenZeppelin Upgradeable proxy pattern. 
     * @dev Initializes msg.sender as DEFAULT_ROLE_ADMIN
     * @param _moderators array of addresses to give MODERATOR_ROLE
     * @param _pausers array of addresses to give PAUSER_ROLE
     * @param baseTokenURI string to use as base URI for URI autogeneration
     * @param _freeMintEligibleList array of addresses to map TRUE in freeMintEligible mapping
     */
    function initialize(
        address[] memory _moderators,
        address[] memory _pausers,
        string memory baseTokenURI,
        address[] memory _freeMintEligibleList
    ) initializer public payable {

        __ERC721_init("ProjectJ","PRJ");

        // Set base token URI
        _baseTokenURI = baseTokenURI;

        // Initialize default admin role to governor
        _setupRole(DEFAULT_ADMIN_ROLE, governor);

        // Initialize moderators
        uint256 i;
        for (i = 0;i < _moderators.length; i++) {
            _setupRole(MODERATOR_ROLE,_moderators[i]);
        }

        // Initialize pausers
        for (i = 0;i < _pausers.length; i++) {
            _setupRole(PAUSER_ROLE,_pausers[i]);
        }

        // Initialize free mint eligible addresses
        for (i = 0;i < _freeMintEligibleList.length; i++) {
            freeMintEligible[_freeMintEligibleList[i]] = true;
        }

        // Increment counter so first mint starts at token #1
        _tokenIdTracker.increment();
    }

    // Mapping of blacklisted accounts
    mapping(address => bool) public blacklist;

    /** @dev Emit on modification of blacklist standing.
     * @return target address
     * @return target's new standing
     * @return address changing the standing
    */
    event StandingModified(address target, bool newStanding, address changedBy);

    /// @dev Emit on minting
    event Minted(address to, uint256 tokenId);

    /// @dev Emit on free minting
    event MintedFree(address to, uint256 tokenId);

    /// @dev Requires msg.sender to be in good standing
    modifier inGoodStanding() {
        require(!blacklist[msg.sender],"Account is blacklisted.");
        _;
    }

    /// @dev Requires msg.sender to have 0 balance of Project J NFTs
    modifier onePerWallet() {
        require(balanceOf(msg.sender) == 0,"One per customer");
        _;
    }

    /// @dev requires sender to be the governor address
    modifier onlyGovernor() {
        require(msg.sender == governor,"Only contract governor may call");
        _;
    }

    /**
     * @dev Overrides OZ ERC721 _baseURI as per design intent of the library function
     * @return _baseTokenURI the base string used in autogeneration of token URIs
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Updates the base URI string
     * @param _newURI string to use as the new _baseTokenURI
     * Requirements: 
     * - the caller must have the 'GOVERNOR_ROLE'
     */
    function updateBaseURI(string memory _newURI) external onlyGovernor {
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
    function pause() external virtual onlyRole(PAUSER_ROLE) {
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
    function unpause() external virtual onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Modify the standing of the target address. 
     * Requirements:
     * - Cannot change own standing. 
     * - Requires MODERATOR_ROLE. 
     * - Requires good standing.
     * @param target address to modify the standing of
     * @param newStanding standing to change to
     */ 
    function modifyStanding(address target, bool newStanding) inGoodStanding onlyRole(MODERATOR_ROLE) external {
        require(target != msg.sender,"User cannot modify their own standing.");
        blacklist[target] = newStanding;
        emit StandingModified(target, newStanding, msg.sender);
    }

    /**
     * @dev Return standing of target address.
     * @param _address address to check the standing of
     * @return true if blacklisted, false if good standing
     */ 
    function checkStanding(address _address) external view returns (bool) {
        return blacklist[_address];
    }

    /**
     * @dev Mint NFT. 
     * Requirements:
     * - Requires good standing
     * - Requires 0 wallet balance of ProjectJ NFTs
     * - Requires msg.value >= mintPrice
     */ 
    function mint() external payable inGoodStanding onePerWallet {
        require(msg.value >= mintPrice,"Mint price not correct");
        uint256 currentId = _tokenIdTracker.current();
        _tokenIdTracker.increment();
        emit Minted(msg.sender, currentId);
        _safeMint(msg.sender, currentId);
    }

    /**
     * @dev Mint NFT without mint cost. 
     * Requirements:
     * - Requires good standing
     * - Requires 0 wallet balance of ProjectJ NFTs
     * - Requires msg.sender to be eligible for free mint
     */ 
    function mintFree() external inGoodStanding onePerWallet {
        require(freeMintEligible[msg.sender],"Not eligible for free mint");
        freeMintEligible[msg.sender] = false;
        uint256 currentId = _tokenIdTracker.current();
        _tokenIdTracker.increment();
        emit MintedFree(msg.sender, currentId);
        _safeMint(msg.sender, currentId);
    }

    /**
     * @dev Withdraw contract balance
     * Requirements:
     * - Requires GOVERNOR_ROLE
     * - May only be called by governor address
     */ 
    function withdraw() external onlyGovernor {
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

    /// @dev Hook required for standards compatability
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721Upgradeable, ERC721PausableUpgradeable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

}
