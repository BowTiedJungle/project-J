# project-J


## Overview
Project J is a jungle-native project seeking to allow NFT-verified proof of jungle membership. This jungle membership will then provide access to private resources such as a jungle wiki, forums, shitpost hall of fame, or whatever else we want to add to it. Deployment will occur in two phases. Phase 1 will be governed by trusted jungle members. All funds will be behind a multisig. Phase 2 will move to DAO governance of the Project J protocol.

## Technical details
Building for Ethereum mainnet. Uses hardhat development environment. Uses OpenZeppelin proxy pattern for upgradeable smart contracts. Will use Gnosis safe for multisig.

### Commands (execute from solidity directory)
Running scripts:
`npx hardhat run scripts/deploy.js`

Optional `--network` flag deploys to specific networks defined in `hardhat.config.js`

Running unit tests:
`npx hardhat test`

Running local dev node:
`npx hardhat node` then start a second terminal, and run scripts from that one. This can be used to verify correct performance of the upgradeable infrastructure for instance.

## To-do
A very unexhaustive list of things needing attention.

* Project Admin
    * Notion/Trello/Etc for tracking and documentation
* Solidity
    * Testing of multisig solution via Gnosis Safe
    * Add hooks for upgrading to DAO governance
    * Gas optimization
    * Security audit
    * Check for contract best practices
* Website Design
    * Requirements definition
    * Wireframing
    * Tech stack definition

## Requirements

* NFT
    * On-chain good standing yes/no flag
    * Upgradable contract
    * Access control for certain functions (contract admin, good standing revocation)
    * Avatar is mutable, avatar process lives off chain
    * Funds only payable to multisig
