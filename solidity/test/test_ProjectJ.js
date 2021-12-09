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

const whitelist = [
    '0xf730341f6b15f97f6f925c63218dd51654b390e6',
    '0x9b396c07d07570356f69c4ca2d39d5e1c45822cd',
    '0x4d4294657a040a772c4ad705cf2546009134b876',
    '0x68f67301dc1d9a46211eda5c0408de7e44527423',
    '0x58feaa4771f03989f304b94a75002ccb59711fa1',
    '0x0bd37c81cb8e146d91184c3ec006305b6e764b5d',
    '0x1d9b7c128f4939ce70da133aba1d760f1b952a73',
    '0x6b61e3f860e0bec1bf68b76c48d9284cb17e95cf',
    '0x48c7269ba56d0d03053844b1f5eaef36518db0e4',
    '0x4740583ec4889de5017f1aa8f1b50f4ebe81463d',
    '0xfac228f4ed5abf0fef3a0af1036bf075e93c3603',
    '0x6d1a7640afab4ed72dfda17016aebf948dda8688',
    '0x16b5e68f83684740b2da481db60eab42362884b9',
    '0xaa1b1dc94b11225dad612e15dab6a1f6fd3b1aa0',
    '0x9f8de1f0d8d548ff62a16eda25d1d6628c8f7f41',
    '0x703a9870fe0d42cdf5de61710c8cda2a7b56379a',
    '0xdaf8779e4dd55b88ef168d457e295369a70f388f',
    '0xeb5564217d53a0913ceb97533f40f54850219897',
    '0xa892951bcbdc2880de3664e76585381896dbff0a',
    '0xa4ca1e6b1c420b0ae7487ea6067e9c11c2385554',
    '0xc8434f2944545dbd93de65fa97de44b4f3b9d2e4',
    '0xff7b04cd6f3b04f143c9c68e57bd78eec39ec271',
    '0x9ea49d2c06a2c49575823a25d374e50f52194934',
    '0xae9d344e0d888a681b4a3d42d9e69954a61a47e4',
    '0xf2ad260cfb7fdd23e013959b3b1667fb116bd407',
    '0x30109f2b368090340dc4e9b557a964d92cf768c1',
    '0xb420945b0a394447b277d92d39ea49f913e7a862',
    '0x37dac55ce7f786f73883a3a944b49624ae2b06df',
    '0x20fefcee612629742f447e01b836a5060fa743c9',
    '0xf601fce39f7c34565e1b01ec6eca25dbb7d12fda',
    '0x8d23c2dc93be2c90728c45eade4d574e04f82ec3',
    '0x631fffcf26dd58d0277cff3336e37306f590c25f',
    '0xf4e6aa8110907aa260a1bee6bd62ddc21ab6d541',
    '0xca429d8254e7a8055b71fa52b2c5c7460f5a10d5',
    '0x7a64ed13bb20d65a323385080cdf1dc62ce047c2',
    '0xd2f22876cd69d50860e605ba68e3e14167ffd619',
    '0x140fcfe26df6193c0ffceb5cd479f76856b53d81',
    '0x37b35f165a7a0c808974ae651a7b05c6b85eca32',
    '0x18004e86e35479e556ac431153d1f1604bbe9457',
    '0xd19b55f8036b815f4089978af3070446589612ab',
    '0x676a17e068ce5cddeec033736875a161beaa0027',
    '0x0014cdcb271698e0383e16b5013f935733a94ea9',
    '0xa8ecf945e4ec205e35c1dc7bb29b63f3b8ab3d99',
    '0xd2d0ac54d38555b3afd631e4767937fe28c96dfc',
    '0xc06aca0aa8c17fa6ceb20f4619d4fd8f747a102a',
    '0x87131a245d6c74f59df5d2d04d515b5548c2a990',
    '0x1fbb962cd9a1924595f6d6638b950ac30570a38f',
    '0xf60af1b50886d6ed7b4bb04101e5ba0cc053906b',
    '0x637b1a247b05f19d6eaad2e42666cd4131df8331',
    '0x0cd1d691b6ae336302e882eb6dc3e9983bca74e7',
    '0x84ea4a8f2c1d43bce148e7152696a24ac518a19c',
    '0xd74af4583db641cf941ba9f7325e801139e9b48b',
    '0x63ca619d2074b3254b25cf7840d0cd7170ad83c0',
    '0x4f92a9bf8f6269f789c947164297bdfcabc1ed20',
    '0x3baaa2dfa7e81b7968f9e7bc8de918452744b08a',
    '0x539c4d1992c75aca5172c33c5198ad4fbb9e0e93',
    '0xc70ccebc628c8947c70747a16f6c9859b5377051',
    '0x71d897965d084f361ff8a963206947e7e1e910c4',
    '0x1192538013f193fdee4782916186446ce2c90e70',
    '0xa8814849240d8e7e213139b89c4c3c512e145c07',
    '0xf0a4ff26665902af294a5e889d76a07a1247fff2',
    '0x035ef3caee3a3d4e5ed3c646972cebef08d47098',
    '0x925cd4b513113b13fde68d11dc3e46ee27bb4b20',
    '0x573a728c0ad20b215b9a130db774ea91fbef6bbe',
    '0x7d7d7f1a2ad27c110f91eb89ff9c724b0fd738f1',
    '0x7fd0dc54c8b3df6e64f465d25fdc8567d483edb8',
    '0x9f2b6f1d401df8684d73ee4db64f868190541fed',
    '0xaf97c37b18035f9d09d0a9be6979597a0060d253',
    '0xedad84d93dc84d598ab1d0a95c0cbd9bb4b80eda',
    '0x9d8d3477787991af80dd5fce80f74f0acfbd379d',
    '0x2131563a597e8f45547e4913f4a951f709e6f1e2',
    '0xee96f28970acff48827f9b436196b54e3c17ff36',
    '0x64f830a335cfccbabfdac2c99c88e264ff8adb9d',
    '0x5124011b654919868f9e78bc04795237c2290861',
    '0x5874a07c0e30d8f42f882d1d1d092769ccc3e5d5',
    '0xc0924369dc9d77be45542a3190889193a0fac8f0',
    '0xf85ce443d3f031728e0e97503c06322c2f51a0c7',
    '0x3c2b5334cb440472978c4452159ece147aa1d016',
    '0x5ccbb68cde5287fb4afbaf5a5879c46fed8ec5f5',
    '0x7a23bfcb6e84fb61cfef11a6a686948388a96197',
    '0xf58365e2a6c7120758f13b9b5519e484526c3ba9',
    '0x09cf0529ee91407d22e06d12fd93f7daa23455e3',
    '0x74231623d8058afc0a62f919742e15af0fb299e5',
    '0xf69a8989616386cfa268f4aa5dea348537e3a531',
    '0x61ce8496138cad6f8d13ec1d01b73d8236cce716',
    '0x09af078cc2550f37668ab52c2321d57712502d20',
    '0xadaf500b965545c8a766cd9cdeb3bf3fbef073e5',
    '0xa55362bc3f04fc1442f778c9fb7c873eef991407',
    '0xda9194b786fa7e9a8e7004c9b80a506a058cc9c3',
    '0xd340cb68bb77f109e6b11e1d91c34d2bee7a2618',
    '0x63a94a2fc200db8748f2dc7dc5077ad483df4b23',
    '0xf190ee4eaaad941c487fdb3b09d28002ad0cb2d1',
    '0x24aa0f70bd48242aa048cb7bade772cb43aef300',
    '0x7f113098ccfeb1294f4d66bb5ee43fe0d3b793aa',
    '0x6a0568694f74d15472abf187ef770d4512d4b712',
    '0x53e320ba5f3af076cb777009f5a047ee662bbb26',
    '0x475c15f66503725d40467f7a4687b65e53748a43',
    '0x8cf47ba2adc5cdc26ee51faf1ef8a0934cd36015',
    '0x0caf77efcdbfd81c5bc20244a52519c4709b9946',
    '0xd750f0a109a94308890c0f7937a6087ee71874b9',
    '0x98f2429bc9f3d6f9329b747fa4283b031f5c9803',
    '0xe1973cafc2b707a9e8992087cfe0fa51ae8ea028',
    '0xf9de0d8cd1356d65d8045167387505e4456612fc',
    '0x1dfefbb50d2a3cc1cd12240d761066cdf37539ad',
    '0x8fbae6e82379cb1b813911b3e170b42c58d15b9a',
    '0xa43636b69b78412035750549e631613f3d6417fe',
    '0x3a2bc8f9ca50fa2f44ad8f95213185fa98adf8c9',
    '0xf15910fcded04013f079b4fe7d20bae5de3243a3',
    '0xfac7ec09c27cc8b49459c2623b440c1cec4c90e6',
    '0x3d5635c1d78e2706e5698faa6ca32f96f630d4cd',
    '0x9e1faedafd7e68261bfb575f49c2c16e4e0d6444',
    '0x8d5c0326e84c0675deb2b0a33758a73f41d61828',
    '0x1e5b68e77562a63bcd1476a9661773aa9d39cdfa',
    '0x69ac232c0b228434ec97db93a755504efdd84eeb',
    '0xc1254a5a26b6631ee7358dc728629fc2c1b75e5e',
    '0xf4abb756f1289820f9fdfa92b4951b1c6e3306ae',
    '0x890636a115dec99bd644e5d3e5b3026666de50ed',
    '0xa35b2b4eccb966fdf1bef8091cca69d45da338b4',
    '0x0360a0cc5d4df464c17ba439da62fb1ea2a5c3ae',
    '0xe9ee63bc8836f46a1dc1dc7d4ad118c8d3a58eeb',
    '0xbe7f2ae9f218dbc9eeae7bf9f2df0c136fd9e757',
    '0x3a3a11e38b0b98094f43a1c6dba9f3096293abf4',
    '0xf13dbb412f38774147534c77c8c3d72b44b7bce6',
    '0x0128119ae6376443c0c716923deae3ded5109c2f',
    '0xfc6a62335c50f48a3890878ee9767b24d9e15cca',
    '0xc213e3fc116b1e65bc6653d3878d8708359bf57f',
    '0x8f88992af0ec58b2f0ce00ae0adb82f3089eed8d',
    '0x13b92142373cfef4d4614b65c1fc657d1e980cd5',
    '0x86d9dfce8179a1db575d9e07e0b5d1a15df47d0f',
    '0x8732f29396b954521fb05b047224c63ee078b0c1',
    '0x70d31251efa31bca4cfd370db44f0a28fc73662c',
    '0x242ebebdea6c3264a352dd66218b1bc3dad10958',
    '0x31e3c03a64d7701bb24e03c033f1480ab03f5f0b',
    '0xfe72c53f72dcc816c1d548dfbc79f6c5a7567b9a',
    '0xb6194125320bc536f93d3f7bc8bcefd97639ec26',
    '0xccc0323147d36ec86a9dc37d8f731125589b59a0',
    '0x042da94ef03ae9e09ddb716d6cb1dbe109c70bc1',
    '0x571bbb0b15569299fbe0169254e9c16fedee68b4',
    '0x658e6499e83057b46c78763ee40250a88979a969'
    ]

for (i=0;i<whitelist.length;i++) {
    degens.push(whitelist[i]);
}

describe("ProjectJ", function () {

    describe("Checks w/ Special Initialization", function () {

        it("Should NOT initialize if governor is set to zero address.", async function () {
            ProjectJ = await ethers.getContractFactory("ProjectJ");
            await expect(upgrades.deployProxy(ProjectJ,[moderators,pausers,baseURI,hre.ethers.constants.AddressZero,degens])).to.be.revertedWith("ProjectJ: Cannot set admin to zero address");
        });

        it("Should correctly stack roles on addresses.", async function () {
            ProjectJ = await ethers.getContractFactory("ProjectJ");
            projectJ = await upgrades.deployProxy(ProjectJ,[[governor.address],[governor.address],baseURI,governor.address,degens]);
            moderatorRole = hre.ethers.utils.id("MODERATOR_ROLE");
            pauserRole = hre.ethers.utils.id("PAUSER_ROLE");
            governorRole = hre.ethers.utils.id("GOVERNOR_ROLE");
            expect(await projectJ.hasRole(moderatorRole,governor.address)).to.equal(true);
            expect(await projectJ.hasRole(pauserRole,governor.address)).to.equal(true);
            expect(await projectJ.hasRole(governorRole,governor.address)).to.equal(true);
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

        it("Should ONLY grant GOVERNOR_ROLE to the governor address", async function () {
            governorRole = hre.ethers.utils.id("GOVERNOR_ROLE");
            // Check for correct deployment state
            expect(await projectJ.hasRole(governorRole,governor.address)).to.equal(true);
            expect(await projectJ.getRoleMemberCount(governorRole)).to.equal(1);
            expect(await projectJ.getRoleMember(governorRole,0)).to.equal(governor.address);
        });

        it("Should ONLY grant PAUSER_ROLE to all members of the pausers argument", async function () {
            pauserRole = hre.ethers.utils.id("PAUSER_ROLE");
            // Check for correct deployment state
            expect(await projectJ.getRoleMemberCount(pauserRole)).to.equal(2);
            expect(await projectJ.getRoleMember(pauserRole,0)).to.equal(pauser1.address);
            expect(await projectJ.getRoleMember(pauserRole,1)).to.equal(pauser2.address);
        });

        it("Should ONLY grant MODERATOR_ROLE to all members of the moderators argument", async function () {
            moderatorRole = hre.ethers.utils.id("MODERATOR_ROLE");
            // Check for correct deployment state
            expect(await projectJ.getRoleMemberCount(moderatorRole)).to.equal(2);
            expect(await projectJ.getRoleMember(moderatorRole,0)).to.equal(mod1.address);
            expect(await projectJ.getRoleMember(moderatorRole,1)).to.equal(mod2.address);
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