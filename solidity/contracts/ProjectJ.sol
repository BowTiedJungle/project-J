//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";

contract ProjectJ is 
    ERC721Upgradeable,
    ERC721BurnableUpgradeable,
    ERC721PausableUpgradeable,
    AccessControlEnumerableUpgradeable
{

    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _tokenIdTracker;

    // Merkle root storage
    bytes32 private merkleRoot;

    // Declare roles for AccessControl
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    // Base string used in token URI generation
    string private _baseTokenURI;

    // Contract governor address
    address payable public governor;

    // Mint price for paid mint
    uint256 public constant mintPrice = 0.1 ether;

    // Maps address to whether the free mint has been claimed
    mapping(address => bool) public freeMintClaimed;

    // Mapping of blacklisted accounts
    mapping(address => bool) public blacklist;

    /**
     * @dev Initializer function for OpenZeppelin Upgradeable proxy pattern. 
     * @dev Initializes msg.sender as DEFAULT_ROLE_ADMIN
     * @param _moderators array of addresses to give MODERATOR_ROLE
     * @param _pausers array of addresses to give PAUSER_ROLE
     * @param baseTokenURI string to use as base URI for URI autogeneration
     * @param _governor address to give GOVERNOR_ROLE
     * @param _merkleRoot root of the whitelisted addresses merkle tree
     */
    function initialize(
        address[] memory _moderators,
        address[] memory _pausers,
        string memory baseTokenURI,
        address payable _governor,
        bytes32 _merkleRoot
    ) initializer public payable {

        __ERC721_init("ProjectJ","PRJ");

        // Set contract governor
        require(_governor != address(0),'ProjectJ: Cannot set admin to zero address');
        governor = _governor;
        _setupRole(GOVERNOR_ROLE, _governor);

        // Set base token URI
        _baseTokenURI = baseTokenURI;

        // Set root of whitelist merkle tree
        merkleRoot = _merkleRoot;

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

        // Increment counter so first mint starts at token #1
        _tokenIdTracker.increment();
    }

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
        require(!blacklist[msg.sender],"ProjectJ: Account is blacklisted.");
        _;
    }

    /// @dev Requires msg.sender to have 0 balance of Project J NFTs
    modifier onePerWallet() {
        require(balanceOf(msg.sender) == 0,"ProjectJ: Account has >0 PRJ NFTs");
        _;
    }

    /**
     * @dev Returns the leaf hash for given input data
     * @param account address to hash
     */
    function _leaf(address account) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(account));
    }

    /**
     * @dev Verifies that a given leaf is in the whitelist merkle tree
     * @param _leafNode Leaf hash to verify
     * @param proof Array of hashes proving leaf
     */
    function _verify(bytes32 _leafNode, bytes32[] memory proof) internal view returns (bool) {
        return MerkleProofUpgradeable.verify(proof, merkleRoot, _leafNode);
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
    function updateBaseURI(string memory _newURI) external onlyRole(GOVERNOR_ROLE) {
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
    function pause() external virtual {
        require(hasRole(PAUSER_ROLE, _msgSender()), "ProjectJ: Must have pauser role to pause");
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
    function unpause() external virtual {
        require(hasRole(PAUSER_ROLE, _msgSender()), "ProjectJ: Must have pauser role to unpause");
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
        require(target != msg.sender,"ProjectJ: User cannot modify their own standing.");
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
        require(msg.value >= mintPrice,"ProjectJ: Mint price not correct");
        uint256 currentId = _tokenIdTracker.current();
        _tokenIdTracker.increment();
        emit Minted(msg.sender, currentId);
        _safeMint(msg.sender, currentId);
    }

    /**
     * @dev Mint NFT without mint cost. 
     * @param proof array of hashes proving msg.sender is in the whitelist tree
     * Requirements:
     * - Requires good standing
     * - Requires 0 wallet balance of ProjectJ NFTs
     * - Requires a valid proof that msg.sender is in the whitelist tree
     */ 
    function mintFree(bytes32[] calldata proof) external inGoodStanding onePerWallet {
        require(_verify(_leaf(msg.sender),proof),'ProjectJ: Invalid proof provided.');
        require(!freeMintClaimed[msg.sender],"ProjectJ: Free mint already claimed.");
        uint256 currentId = _tokenIdTracker.current();
        _tokenIdTracker.increment();
        freeMintClaimed[msg.sender] = true;
        emit MintedFree(msg.sender, currentId);
        _safeMint(msg.sender, currentId);
    }

    /**
     * @dev Withdraw contract balance
     * Requirements:
     * - Requires GOVERNOR_ROLE
     * - May only be called by governor address
     */ 
    function withdraw() external onlyRole(GOVERNOR_ROLE) {
        require(msg.sender == governor,"ProjectJ: Only governor can withdraw.");
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
