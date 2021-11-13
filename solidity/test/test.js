const { expect } = require("chai");
const { ethers } = require("hardhat");
const { waffle } = require("hardhat");

// Set up the test addresses used, uses waffle syntax vs. ethers.getSigners as hardhat testing uses waffle under the hood
// mod1, mod2: permissioned accounts. citizen1, citizen2, ... :non-permissioned accounts eg. users
const provider = waffle.provider;
const [mod1, mod2, citizen1, citizen2, governor] = provider.getWallets();
var moderators = [mod1.address,mod2.address];   //The .address syntax is used to get addy from the Signer object
var pausers = [mod1.address,mod2.address];
const baseURI = "testURI";

describe("ProjectJ", function () {

    it("Should change the blacklist status of an address when modifyStanding is called by a moderator", async function () {
        // Initialize the smart contract
        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI,governor.address);
        await projectJ.deployed();

        // Check for expected initial state
        expect(await projectJ.checkStanding(citizen1.address)).to.equal(false);

        // Call function
        const setBlacklist = await projectJ.modifyStanding(citizen1.address,true);
        await setBlacklist;

        // Check for expected final state
        expect(await projectJ.checkStanding(citizen1.address)).to.equal(true);

    });

    it("Should NOT change the blacklist status of an address when modifyStanding is called without moderator role", async function () {
        // Initialize the smart contract
        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI,governor.address);
        await projectJ.deployed();

        // Check for expected initial state
        expect(await projectJ.checkStanding(citizen1.address)).to.equal(false);

        // Attempt to call, expecting reversion
        await expect(projectJ.connect(citizen2).modifyStanding(citizen1.address,true)).to.be.reverted;

        // Check for expected final state
        expect(await projectJ.checkStanding(citizen1.address)).to.equal(false);

    });

    it("Should NOT allow a user to change their own blacklist status", async function () {
        // Initialize the smart contract
        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI,governor.address);
        await projectJ.deployed();

        // Check for expected initial state
        expect(await projectJ.checkStanding(mod1.address)).to.equal(false);

        // Attempt to call, expecting reversion
        await expect(projectJ.modifyStanding(mod1.address,true)).to.be.reverted;

        // Check for expected final state
        expect(await projectJ.checkStanding(mod1.address)).to.equal(false);

    });

    it("Should NOT allow a blacklisted moderator to change a blacklist status", async function () {
        // Initialize the smart contract
        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI,governor.address);
        await projectJ.deployed();

        // Check for expected initial state
        expect(await projectJ.checkStanding(mod2.address)).to.equal(false);
        // Blacklist the mod2 address
        await projectJ.modifyStanding(mod2.address,true);
        // Check that blacklisting was successful
        expect(await projectJ.checkStanding(mod2.address)).to.equal(true);

        // Attempt to call, expecting reversion
        await expect(projectJ.connect(mod2).modifyStanding(citizen1.address,true)).to.be.reverted;

        // Check for expected final state
        expect(await projectJ.checkStanding(citizen1.address)).to.equal(false);

    });

    it("Should pause the contract when called with PAUSER_ROLE", async function () {
        // Initialize the smart contract
        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI,governor.address);
        await projectJ.deployed();

        // Check for expected initial state
        expect(await projectJ.paused()).to.equal(false);

        // Call function
        await projectJ.pause();

        // Check for expected final state
        expect(await projectJ.paused()).to.equal(true);

    });

    it("Should NOT pause the contract when called without PAUSER_ROLE", async function () {
        // Initialize the smart contract
        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI,governor.address);
        await projectJ.deployed();

        // Check for expected initial state
        expect(await projectJ.paused()).to.equal(false);

        // Attempt to call, expecting reversion
        await expect(projectJ.connect(citizen1).pause()).to.be.reverted;

        // Check for expected final state
        expect(await projectJ.paused()).to.equal(false);

    });

    it("Should NOT unpause the contract when called without PAUSER_ROLE", async function () {
        // Initialize the smart contract
        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI,governor.address);
        await projectJ.deployed();

        // Check for expected initial state
        expect(await projectJ.paused()).to.equal(false);

        // Pause contract
        await projectJ.pause();

        // Attempt to call, expecting reversion
        await expect(projectJ.connect(citizen1).unpause()).to.be.reverted;

        // Check for expected final state
        expect(await projectJ.paused()).to.equal(true);

    });

    it("Should pause and unpause the contract correctly when called with PAUSER_ROLE", async function () {
        // Initialize the smart contract
        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI,governor.address);
        await projectJ.deployed();

        // Check for expected initial state
        expect(await projectJ.paused()).to.equal(false);

        // Pause contract
        await projectJ.pause();

        // Check for expected initial state
        expect(await projectJ.paused()).to.equal(true);

        // Pause contract
        await projectJ.unpause();

        // Check for expected final state
        expect(await projectJ.paused()).to.equal(false);

    });

    it("Should mint NFT", async function () {
        // Initialize the smart contract
        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI,governor.address);
        await projectJ.deployed();

        // Check for expected initial state
        expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);

        // Call contract
        await projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.1')});

        // Check for expected final state
        expect(await projectJ.balanceOf(citizen1.address)).to.equal(1);

    });

    it("Should not mint NFT to blacklisted address", async function () {
        // Initialize the smart contract
        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI,governor.address);
        await projectJ.deployed();

        // Check for expected initial states
        expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);
        expect(await projectJ.checkStanding(citizen1.address)).to.equal(false);

        // Blacklist citizen1
        await projectJ.modifyStanding(citizen1.address,true);

        // Call contract, expecting reversion
        await expect(projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.1')})).to.be.reverted;

        // Check for expected final state
        expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);

    });

    it("Should not allow minting more than 1 NFT", async function () {
        // Initialize the smart contract
        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI,governor.address);
        await projectJ.deployed();

        // Check for expected initial state
        expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);

        // Call contract once to setup
        await projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.1')});

        // Call contract expecting reversion
        await expect(projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.1')})).to.be.reverted;

        // Check for expected final state
        expect(await projectJ.balanceOf(citizen1.address)).to.equal(1);

    });

    it("Should NOT mint NFT with wrong mint price", async function () {
        // Initialize the smart contract
        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI,governor.address);
        await projectJ.deployed();

        // Check for expected initial state
        expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);

        // Call contract
        await expect(projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.2')})).to.be.revertedWith("Mint price not correct");

        // Check for expected final state
        expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);

    });

    it("Should deduct mintPrice on successful mint", async function () {
        // Initialize the smart contract
        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI,governor.address);
        await projectJ.deployed();

        // Check for expected initial state
        expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);
        const initialBal = await citizen1.getBalance();

        // Estimate gas
        const estGasUnits = await projectJ.estimateGas.mint({value: hre.ethers.utils.parseEther('0.1')});
        const gasPrice = await provider.getGasPrice();
        const gasCost = estGasUnits * gasPrice;

        // Call contract
        await projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.1')});

        // Check for mint correctly
        expect(await projectJ.balanceOf(citizen1.address)).to.equal(1);

        // Check final balance
        const finalBal = await citizen1.getBalance();

        // Verbose log
        console.log("--- Mint Cost Report ---")
        console.log("Initial: ",hre.ethers.utils.formatUnits(initialBal,'ether'));
        console.log("Final: ",hre.ethers.utils.formatUnits(finalBal,'ether'));
        console.log("Est Gas: ",hre.ethers.utils.formatUnits(gasCost,'ether'))
        console.log("----");
        console.log("Initial - Final: ",hre.ethers.utils.formatUnits(initialBal.sub(finalBal),'ether'));
        console.log("Initial - Final - Gas: ",hre.ethers.utils.formatUnits(initialBal.sub(finalBal).sub(gasCost),'ether'));
        console.log("Initial - Final - Gas - Mint",hre.ethers.utils.formatUnits(initialBal-finalBal-gasCost-hre.ethers.utils.parseEther('0.1'),'ether'));

        expect(initialBal.sub(finalBal)).to.be.above(hre.ethers.utils.parseEther('0.1'));
    });

    it("Should increase the contract ETH balance when NFT is minted", async function () {
        // Initialize the smart contract
        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI,governor.address);
        await projectJ.deployed();

        // Check inital contract balance
        expect(await provider.getBalance(projectJ.address)).to.equal(hre.ethers.utils.parseEther('0'));

        // Mint checking
        // Check for expected initial state
        expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);
        // Call contract
        await projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.1')});
        // Check for expected final state
        expect(await projectJ.balanceOf(citizen1.address)).to.equal(1);

        // Check final contract balance
        expect(await provider.getBalance(projectJ.address)).to.equal(hre.ethers.utils.parseEther('0.1'));

    });

});