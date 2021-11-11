const { expect } = require("chai");
const { ethers } = require("hardhat");
const { waffle } = require("hardhat");

// Set up the test addresses used, uses waffle syntax vs. ethers.getSigners as hardhat testing uses waffle under the hood
// mod1, mod2: permissioned accounts. citizen1, citizen2, ... :non-permissioned accounts eg. users
const provider = waffle.provider;
const [mod1, mod2, citizen1, citizen2] = provider.getWallets();
var moderators = [mod1.address,mod2.address];   //The .address syntax is used to get addy from the Signer object
var pausers = [mod1.address,mod2.address];
const baseURI = "testURI";

describe("ProjectJ", function () {

    it("Should change the blacklist status of an address when modifyStanding is called by a moderator", async function () {
        // Initialize the smart contract
        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI);
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
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI);
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
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI);
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
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI);
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


});