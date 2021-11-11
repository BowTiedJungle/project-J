const { expect } = require("chai");
const { ethers } = require("hardhat");
const { waffle } = require("hardhat");

const provider = waffle.provider;
const [tester1, tester2, tester3] = provider.getWallets();
var moderators = [tester1.address];
var pausers = [tester1.address];
const baseURI = "testURI";

describe("ProjectJ", function () {

    it("Should change the blacklist status of an address when modifyStanding is called by a moderator", async function () {

        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI);
        await projectJ.deployed();

        expect(await projectJ.checkStanding(tester2.address)).to.equal(false);

        const setBlacklist = await projectJ.modifyStanding(tester2.address,true);
        await setBlacklist;

        expect(await projectJ.checkStanding(tester2.address)).to.equal(true);

    });

    it("Should NOT change the blacklist status of an address when modifyStanding is called without moderator role", async function () {

        const ProjectJ = await ethers.getContractFactory("ProjectJ");
        const projectJ = await ProjectJ.deploy(moderators,pausers,baseURI);
        await projectJ.deployed();

        expect(await projectJ.checkStanding(tester3.address)).to.equal(false);

        await expect(projectJ.connect(tester2).modifyStanding(tester3.address,true)).to.be.reverted;

        expect(await projectJ.checkStanding(tester3.address)).to.equal(false);

    });


});