const { expect } = require("chai");
const { ethers } = require("hardhat");
const { waffle } = require("hardhat");

const provider = waffle.provider;
const [mod1, mod2, citizen1, citizen2] = provider.getWallets();
var moderators = [mod1.address,mod2.address];
var pausers = [mod1.address,mod2.address];
const baseURI = "testURI";

describe("ProjectJ", function () {

    it("Should change the blacklist status of an address when modifyStanding is called by a moderator", async function () {

        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI);
        await projectJ.deployed();

        expect(await projectJ.checkStanding(citizen1.address)).to.equal(false);

        const setBlacklist = await projectJ.modifyStanding(citizen1.address,true);
        await setBlacklist;

        expect(await projectJ.checkStanding(citizen1.address)).to.equal(true);

    });

    it("Should NOT change the blacklist status of an address when modifyStanding is called without moderator role", async function () {

        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI);
        await projectJ.deployed();

        expect(await projectJ.checkStanding(citizen1.address)).to.equal(false);

        await expect(projectJ.connect(citizen2).modifyStanding(citizen1.address,true)).to.be.reverted;

        expect(await projectJ.checkStanding(citizen1.address)).to.equal(false);

    });

    it("Should NOT allow a user to change their own blacklist status", async function () {

        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI);
        await projectJ.deployed();

        expect(await projectJ.checkStanding(mod1.address)).to.equal(false);

        await expect(projectJ.modifyStanding(mod1.address,true)).to.be.reverted;

        expect(await projectJ.checkStanding(mod1.address)).to.equal(false);

    });

    it("Should NOT allow a blacklisted moderator to change a blacklist status", async function () {

        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI);
        await projectJ.deployed();

        expect(await projectJ.checkStanding(mod2.address)).to.equal(false);
        await projectJ.modifyStanding(mod2.address,true);
        expect(await projectJ.checkStanding(mod2.address)).to.equal(true);

        await expect(projectJ.connect(mod2).modifyStanding(citizen1.address,true)).to.be.reverted;

        expect(await projectJ.checkStanding(citizen1.address)).to.equal(false);

    });


});