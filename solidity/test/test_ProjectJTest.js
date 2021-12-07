const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { solidity } = waffle;

// Set up the test addresses used, uses waffle syntax vs. ethers.getSigners as hardhat testing uses waffle under the hood
// mod1, mod2: permissioned accounts. citizen1, citizen2, ... :non-permissioned accounts eg. users
const provider = waffle.provider;
const [mod1, mod2, citizen1, citizen2, governor, degen1, degen2] = provider.getWallets();
var moderators = [mod1.address,mod2.address];   //The .address syntax is used to get addy from the Signer object
var pausers = [mod1.address,mod2.address];
var degens = [degen1.address,degen2.address]
const baseURI = "testURI";

describe("ProjectJ Upgrade Test", function () {

    beforeEach(async function () {
        ProjectJ = await ethers.getContractFactory("ProjectJ");
        ProjectJTest = await ethers.getContractFactory("ProjectJTest");

        projectJ = await upgrades.deployProxy(ProjectJ,[moderators,pausers,baseURI,governor.address,degens]);
        projectJTest = await upgrades.upgradeProxy(projectJ.address,ProjectJTest);
    });

    it('Should call the upgraded instance unique function', async function () {
        expect((await projectJTest.proxyTest()).toString()).to.equal('42');
    });

});