const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { solidity } = waffle;

// Set up the test addresses used, uses waffle syntax vs. ethers.getSigners as hardhat testing uses waffle under the hood
// dev: deployer address granted DEFAULT_ADMIN_ROLE
// mod1, mod2: permissioned accounts granted MODERATOR_ROLE 
// citizen1, citizen2: non-permissioned accounts eg. users
// pauser1, pauser2: permissioned accounts granted PAUSER_ROLE
// governor: contract administrator account granted GOVERNOR_ROLE
// free1, free2: free mint eligible accounts
const provider = waffle.provider;
const [dev, mod1, mod2, citizen1, citizen2, governor, free1, free2, pauser1, pauser2] = provider.getWallets();
var moderators = [mod1.address,mod2.address];   //The .address syntax is used to get addy from the Signer object
var pausers = [pauser1.address,pauser2.address];
var degens = [free1.address,free2.address]
const baseURI = "testURI";

describe("ProjectJ", function () {

    describe("Checks w/ Special Initialization", function () {

        it("Should NOT initialize if governor is set to zero address.", async function () {
            ProjectJ = await ethers.getContractFactory("ProjectJ");
            await expect(upgrades.deployProxy(ProjectJ,[moderators,pausers,baseURI,hre.ethers.constants.AddressZero,degens])).to.be.revertedWith("ProjectJ: Cannot set admin to zero address");
        });
    });

    describe("Initialization", function () {

        beforeEach(async function () {
            ProjectJ = await ethers.getContractFactory("ProjectJ");
            projectJ = await upgrades.deployProxy(ProjectJ,[moderators,pausers,baseURI,governor.address,degens]);
        });

        it("Should grant MODERATOR_ROLE to all members of the moderators argument", async function () {
            moderatorRole = hre.ethers.utils.id("MODERATOR_ROLE");
            // Check for correct deployment state
            expect(await projectJ.hasRole(moderatorRole,moderators[0])).to.equal(true);
            expect(await projectJ.hasRole(moderatorRole,moderators[1])).to.equal(true);

        });

        it("Should grant PAUSER_ROLE to all members of the pausers argument", async function () {
            pauserRole = hre.ethers.utils.id("PAUSER_ROLE");
            // Check for correct deployment state
            expect(await projectJ.hasRole(pauserRole,pausers[0])).to.equal(true);
            expect(await projectJ.hasRole(pauserRole,pausers[1])).to.equal(true);

        });

        it("Should grant DEFAULT_ADMIN_ROLE to the deploying address", async function () {
            defaultAdminRole = hre.ethers.utils.formatBytes32String('');
            // Check for correct deployment state
            expect(await projectJ.hasRole(defaultAdminRole,dev.address)).to.equal(true);

        });

        it("Should grant GOVERNOR_ROLE to the governor address argument", async function () {
            governorRole = hre.ethers.utils.id("GOVERNOR_ROLE");
            // Check for correct deployment state
            expect(await projectJ.hasRole(governorRole,governor.address)).to.equal(true);

        });

        it("Should start tokenId as 1", async function () {

            // Check for expected initial state
            expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);

            // Call contract
            await projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.1')});

            // Check for expected final state
            expect(await projectJ.balanceOf(citizen1.address)).to.equal(1);

            // Check that token ID is as expected
            expect(await projectJ.ownerOf(1)).to.equal(citizen1.address);

        });

        it("Should set free mint eligiblity to TRUE for members of _freeMintEligibleList", async function () {

            expect(await projectJ.freeMintEligible(free1.address)).to.equal(true)
            expect(await projectJ.freeMintEligible(free2.address)).to.equal(true)

        });

        it("Should NOT set free mint eligiblity to TRUE for other addresses", async function () {

            expect(await projectJ.freeMintEligible(mod1.address)).to.equal(false)
            expect(await projectJ.freeMintEligible(pauser1.address)).to.equal(false)

        });

    });

    describe("Blacklisting", function () {

        beforeEach(async function () {
            ProjectJ = await ethers.getContractFactory("ProjectJ");
            projectJ = await upgrades.deployProxy(ProjectJ,[moderators,pausers,baseURI,governor.address,degens]);
        });

        it("Should change the blacklist status of an address when modifyStanding is called by a moderator", async function () {

            // Check for expected initial state
            expect(await projectJ.checkStanding(citizen1.address)).to.equal(false);

            // Call function
            await projectJ.connect(mod1).modifyStanding(citizen1.address,true);

            // Check for expected final state
            expect(await projectJ.checkStanding(citizen1.address)).to.equal(true);

        });

        it("Should NOT change the blacklist status of an address when modifyStanding is called without moderator role", async function () {

            // Check for expected initial state
            expect(await projectJ.checkStanding(citizen1.address)).to.equal(false);

            // Attempt to call, expecting reversion
            await expect(projectJ.connect(citizen2).modifyStanding(citizen1.address,true)).to.be.reverted;

            // Check for expected final state
            expect(await projectJ.checkStanding(citizen1.address)).to.equal(false);

        });

        it("Should NOT allow a user to change their own blacklist status", async function () {

            // Check for expected initial state
            expect(await projectJ.checkStanding(mod1.address)).to.equal(false);

            // Attempt to call, expecting reversion
            await expect(projectJ.connect(mod1).modifyStanding(mod1.address,true)).to.be.reverted;

            // Check for expected final state
            expect(await projectJ.checkStanding(mod1.address)).to.equal(false);

        });

        it("Should NOT allow a blacklisted moderator to change a blacklist status", async function () {

            // Check for expected initial state
            expect(await projectJ.checkStanding(mod2.address)).to.equal(false);
            // Blacklist the mod2 address
            await projectJ.connect(mod1).modifyStanding(mod2.address,true);
            // Check that blacklisting was successful
            expect(await projectJ.checkStanding(mod2.address)).to.equal(true);

            // Attempt to call, expecting reversion
            await expect(projectJ.connect(mod2).modifyStanding(citizen1.address,true)).to.be.reverted;

            // Check for expected final state
            expect(await projectJ.checkStanding(citizen1.address)).to.equal(false);

        });

        it("Should emit StandingModified when modifyStanding() is successfully called", async function () {

            // Check for expected initial state
            expect(await projectJ.checkStanding(citizen1.address)).to.equal(false);

            // Attempt to call, expecting event emission
            await expect(projectJ.connect(mod1).modifyStanding(citizen1.address,true)).to.emit(projectJ,'StandingModified').withArgs(citizen1.address,true,mod1.address)

            // Check for expected final state
            expect(await projectJ.checkStanding(citizen1.address)).to.equal(true);

        });

    });

    describe("Pausing", function () {

        beforeEach(async function () {
            ProjectJ = await ethers.getContractFactory("ProjectJ");
            projectJ = await upgrades.deployProxy(ProjectJ,[moderators,pausers,baseURI,governor.address,degens]);
        });

        it("Should pause the contract when called with PAUSER_ROLE", async function () {

            // Check for expected initial state
            expect(await projectJ.paused()).to.equal(false);

            // Call function
            await projectJ.connect(pauser1).pause();

            // Check for expected final state
            expect(await projectJ.paused()).to.equal(true);

        });

        it("Should NOT pause the contract when called without PAUSER_ROLE", async function () {

            // Check for expected initial state
            expect(await projectJ.paused()).to.equal(false);

            // Attempt to call, expecting reversion
            await expect(projectJ.connect(citizen1).pause()).to.be.reverted;

            // Check for expected final state
            expect(await projectJ.paused()).to.equal(false);

        });

        it("Should NOT unpause the contract when called without PAUSER_ROLE", async function () {

            // Check for expected initial state
            expect(await projectJ.paused()).to.equal(false);

            // Pause contract
            await projectJ.connect(pauser1).pause();

            // Attempt to call, expecting reversion
            await expect(projectJ.connect(citizen1).unpause()).to.be.reverted;

            // Check for expected final state
            expect(await projectJ.paused()).to.equal(true);

        });

        it("Should NOT allow mint while contract is paused", async function () {

            // Check for expected initial state
            expect(await projectJ.paused()).to.equal(false);

            // Pause contract
            await projectJ.connect(pauser1).pause();
            expect(await projectJ.paused()).to.equal(true);

            // Attempt to call, expecting reversion
            await expect(projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.1')})).to.be.reverted;

            // Check for expected final state
            expect(await projectJ.balanceOf(citizen1.address)).to.equal(0)

        });

        it("Should NOT allow free mint while contract is paused", async function () {

            // Check for expected initial state
            expect(await projectJ.paused()).to.equal(false);

            // Pause contract
            await projectJ.connect(pauser1).pause();
            expect(await projectJ.paused()).to.equal(true);

            // Attempt to call, expecting reversion
            await expect(projectJ.connect(free1).mintFree()).to.be.reverted;

            // Check for expected final state
            expect(await projectJ.balanceOf(free1.address)).to.equal(0)

        });

        it("Should pause and unpause the contract correctly when called with PAUSER_ROLE", async function () {

            // Check for expected initial state
            expect(await projectJ.paused()).to.equal(false);

            // Pause contract
            await projectJ.connect(pauser1).pause();

            // Check for expected initial state
            expect(await projectJ.paused()).to.equal(true);

            // Pause contract
            await projectJ.connect(pauser1).unpause();

            // Check for expected final state
            expect(await projectJ.paused()).to.equal(false);

        });

        it("Should allow withdrawal while contract is paused", async function () {

            // Check for expected initial state
            expect(await projectJ.paused()).to.equal(false);

            // Fund contract
            await projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.1')});

            // Check initial contract balance
            expect(await provider.getBalance(projectJ.address)).to.equal(hre.ethers.utils.parseEther('0.1'));

            // Pause contract
            await projectJ.connect(pauser1).pause();
            expect(await projectJ.paused()).to.equal(true);

            // Attempt to call, expecting success
            await projectJ.connect(governor).withdraw();

            // Check final contract balance
            expect(await provider.getBalance(projectJ.address)).to.equal(hre.ethers.utils.parseEther('0'));

        });
    
    });

    describe("Basic Minting", function () {

        beforeEach(async function () {
            ProjectJ = await ethers.getContractFactory("ProjectJ");
            projectJ = await upgrades.deployProxy(ProjectJ,[moderators,pausers,baseURI,governor.address,degens]);
        });

        it("Should mint NFT", async function () {

            // Check for expected initial state
            expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);

            // Call contract
            await projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.1')});

            // Check for expected final state
            expect(await projectJ.balanceOf(citizen1.address)).to.equal(1);

        });

        it("Should not mint NFT to blacklisted address", async function () {

            // Check for expected initial states
            expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);
            expect(await projectJ.checkStanding(citizen1.address)).to.equal(false);

            // Blacklist citizen1
            await projectJ.connect(mod1).modifyStanding(citizen1.address,true);

            // Call contract, expecting reversion
            await expect(projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.1')})).to.be.reverted;

            // Check for expected final state
            expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);

        });

        it("Should not allow minting more than 1 NFT", async function () {

            // Check for expected initial state
            expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);

            // Call contract once to setup
            await projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.1')});

            // Call contract expecting reversion
            await expect(projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.1')})).to.be.reverted;

            // Check for expected final state
            expect(await projectJ.balanceOf(citizen1.address)).to.equal(1);

        });

        it("Should NOT mint NFT with low mint price", async function () {

            // Check for expected initial state
            expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);

            // Call contract
            await expect(projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.05')})).to.be.revertedWith("Mint price not correct");

            // Check for expected final state
            expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);

        });

        it("Should mint NFT with value higher than mint price", async function () {

            // Check for expected initial state
            expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);

            // Call contract
            await projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.2')});

            // Check for expected final state
            expect(await projectJ.balanceOf(citizen1.address)).to.equal(1);

        });

        it("Should deduct mintPrice on successful mint", async function () {

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

            // // Verbose log
            // console.log("--- Mint Cost Report ---")
            // console.log("Initial: ",hre.ethers.utils.formatUnits(initialBal,'ether'));
            // console.log("Final: ",hre.ethers.utils.formatUnits(finalBal,'ether'));
            // console.log("Est Gas: ",hre.ethers.utils.formatUnits(gasCost,'ether'))
            // console.log("----");
            // console.log("Initial - Final: ",hre.ethers.utils.formatUnits(initialBal.sub(finalBal),'ether'));
            // console.log("Initial - Final - Gas: ",hre.ethers.utils.formatUnits(initialBal.sub(finalBal).sub(gasCost),'ether'));
            // console.log("Initial - Final - Gas - Mint",hre.ethers.utils.formatUnits(initialBal-finalBal-gasCost-hre.ethers.utils.parseEther('0.1'),'ether'));

            expect(initialBal.sub(finalBal)).to.be.above(hre.ethers.utils.parseEther('0.1'));

            // await expect(await projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther("0.1")})).to.changeEtherBalance(citizen1.address,hre.ethers.utils.parseEther('0.1'))
            // // Check for mint correctly
            // expect(await projectJ.balanceOf(citizen1.address)).to.equal(1);
        });


        it("Should emit Minted after mint successfully called", async function () {
    
            // Check for expected initial states
            expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);
    
            // Call contract
            await expect(projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther("0.1")})).to.emit(projectJ,'Minted').withArgs(citizen1.address,1);
    
            // Check for expected final state
            expect(await projectJ.balanceOf(citizen1.address)).to.equal(1);

        });

    });

    describe("Funds Handling", function () {

        beforeEach(async function () {
            ProjectJ = await ethers.getContractFactory("ProjectJ");
            projectJ = await upgrades.deployProxy(ProjectJ,[moderators,pausers,baseURI,governor.address,degens]);
        });

        it("Should increase the contract ETH balance when NFT is minted", async function () {

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

        it("Should withdraw the contract ETH balance when called with GOVERNOR_ROLE", async function () {

            // Check inital contract balance
            expect(await provider.getBalance(projectJ.address)).to.equal(hre.ethers.utils.parseEther('0'));

            // Setup
            await projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.1')});

            // Check for successful setup
            expect(await provider.getBalance(projectJ.address)).to.equal(hre.ethers.utils.parseEther('0.1'));

            // Call contract
            await projectJ.connect(governor).withdraw();

            // Check final contract balance
            expect(await provider.getBalance(projectJ.address)).to.equal(hre.ethers.utils.parseEther('0'));

        });

        it("Should NOT withdraw the contract ETH balance when called without GOVERNOR_ROLE", async function () {

            // Check inital contract balance
            expect(await provider.getBalance(projectJ.address)).to.equal(hre.ethers.utils.parseEther('0'));

            // Setup
            await projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.1')});

            // Check for successful setup
            expect(await provider.getBalance(projectJ.address)).to.equal(hre.ethers.utils.parseEther('0.1'));

            // Call contract
            await expect(projectJ.connect(mod1).withdraw()).to.be.reverted;

            // Check final contract balance
            expect(await provider.getBalance(projectJ.address)).to.equal(hre.ethers.utils.parseEther('0.1'));

        });
    
    });

    describe("TokenURI", function () {

        beforeEach(async function () {
            ProjectJ = await ethers.getContractFactory("ProjectJ");
            projectJ = await upgrades.deployProxy(ProjectJ,[moderators,pausers,baseURI,governor.address,degens]);
        });

        it("Should update _baseTokenURI when called with GOVERNOR_ROLE", async function () {

            // Setup
            await projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.1')});

            // Check initial conditions
            expect(await projectJ.tokenURI(1)).to.equal(baseURI+'1');

            // Change URI
            await projectJ.connect(governor).updateBaseURI('xyz/');

            // Check final conditions
            expect(await projectJ.tokenURI(1)).to.equal('xyz/'+'1');
        });

        it("Should NOT update _baseTokenURI when called without GOVERNOR_ROLE", async function () {

            // Setup
            await projectJ.connect(citizen1).mint({value: hre.ethers.utils.parseEther('0.1')});

            // Check initial conditions
            expect(await projectJ.tokenURI(1)).to.equal(baseURI+'1');

            // Attempt call expecting reversion
            await expect(projectJ.connect(citizen1).updateBaseURI('xyz/')).to.be.reverted;

            // Check final conditions
            expect(await projectJ.tokenURI(1)).to.equal(baseURI+'1');
        });

    });

    describe("Free Minting", function () {

        beforeEach(async function () {
            ProjectJ = await ethers.getContractFactory("ProjectJ");
            projectJ = await upgrades.deployProxy(ProjectJ,[moderators,pausers,baseURI,governor.address,degens]);
        });

        it("Should allow free mint to eligible address and remove free eligiblity after minting", async function () {

            // Check for expected initial states
            expect(await projectJ.balanceOf(free1.address)).to.equal(0);
            expect(await projectJ.freeMintEligible(free1.address)).to.equal(true);

            // Call contract
            await projectJ.connect(free1).mintFree();

            // Check for expected final state
            expect(await projectJ.balanceOf(free1.address)).to.equal(1);
            expect(await projectJ.freeMintEligible(free1.address)).to.equal(false);

        });

        it("Should NOT allow free mint to ineligible address", async function () {

            // Check for expected initial states
            expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);
            expect(await projectJ.freeMintEligible(citizen1.address)).to.equal(false);

            // Call contract, expecting reversion
            await expect(projectJ.connect(citizen1).mintFree()).to.be.reverted;

            // Check for expected final state
            expect(await projectJ.balanceOf(citizen1.address)).to.equal(0);
            expect(await projectJ.freeMintEligible(citizen1.address)).to.equal(false);

        });

        it("Should NOT allow free mint if wallet has PRJ balance >0", async function () {

            // Check for expected initial states
            await projectJ.connect(free1).mint({value: hre.ethers.utils.parseEther('0.1')});
            expect(await projectJ.balanceOf(free1.address)).to.equal(1);
            expect(await projectJ.freeMintEligible(free1.address)).to.equal(true);

            // Call contract, expecting reversion
            await expect(projectJ.connect(free1).mintFree()).to.be.reverted;

            // Check for expected final state
            expect(await projectJ.balanceOf(free1.address)).to.equal(1);
            expect(await projectJ.freeMintEligible(free1.address)).to.equal(true);

        });

        it("Should NOT allow free mint to blacklisted address", async function () {

            // Check for expected initial states
            await projectJ.connect(mod1).modifyStanding(free1.address,true);
            expect(await projectJ.balanceOf(free1.address)).to.equal(0);
            expect(await projectJ.freeMintEligible(free1.address)).to.equal(true);
            expect(await projectJ.checkStanding(free1.address)).to.equal(true);

            // Call contract, expecting reversion
            await expect(projectJ.connect(free1).mintFree()).to.be.reverted;

            // Check for expected final state
            expect(await projectJ.balanceOf(free1.address)).to.equal(0);
            expect(await projectJ.freeMintEligible(free1.address)).to.equal(true);

        });

        it("Should emit MintedFree after mintFree successfully called", async function () {
    
            // Check for expected initial states
            expect(await projectJ.balanceOf(free1.address)).to.equal(0);
            expect(await projectJ.freeMintEligible(free1.address)).to.equal(true);
    
            // Call contract
            await expect(projectJ.connect(free1).mintFree()).to.emit(projectJ,'MintedFree').withArgs(free1.address,1);
    
            // Check for expected final state
            expect(await projectJ.balanceOf(free1.address)).to.equal(1);
            expect(await projectJ.freeMintEligible(free1.address)).to.equal(false);

        });

    });

});