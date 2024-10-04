import { ethers } from 'hardhat';

async function main() {
    const simpleLudo = await ethers.deployContract('SimpleLudo');

    await simpleLudo.waitForDeployment();

    console.log('SimpleLudo Contract Deployed at ' + simpleLudo.target);


    //student Portal one
    const studentPortal = await ethers.deployContract('studentPortal');

    await studentPortal.waitForDeployment();

    console.log('studentPortal Contract Deployed at ' + studentPortal.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
