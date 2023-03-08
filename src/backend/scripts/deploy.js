/* global ethers,artifacts */
/* eslint no-undef: "error" */
import hre from 'hardhat';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

dotenv.config();

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const network = process.env.HARDHAT_NETWORK || 'localhost';

const saveFrontendFiles = (contract, name) => {
  const contractsDir = `${dirname}/../../frontend/contractsData/${network}`;

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(`${contractsDir}/${name}-address.json`, JSON.stringify({ address: contract.address }, undefined, 2));

  const contractArtifact = artifacts.readArtifactSync(name);
  fs.writeFileSync(`${contractsDir}/${name}.json`, JSON.stringify(contractArtifact, null, 2));
};

const main = async () => {
  const [deployer] = await hre.ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  for await (const contractData of [
    { name: 'Marketplace', args: [1] },
    { name: 'NFT', args: [] }
  ]) {
    const contract = await hre.ethers.getContractFactory(contractData.name);
    const contractInstance = await contract.deploy(...contractData.args);
    try {
      await hre.ethernal.push({
        name: contractData.name,
        address: contractInstance.address
      });
    } catch (e) {
      console.log('Error pushing to Ethernal', e);
    }
    saveFrontendFiles(contractInstance, contractData.name);
  }
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
