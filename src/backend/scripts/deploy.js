/* global ethers,artifacts */
/* eslint no-undef: "error" */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const saveFrontendFiles = (contract, name) => {
  const contractsDir = `${dirname}/../../frontend/contractsData`;

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    `${contractsDir}/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);
  fs.writeFileSync(
    `${contractsDir}/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
};

const main = async () => {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  const NFT = await ethers.getContractFactory('NFT');
  const Marketplace = await ethers.getContractFactory('Marketplace');

  const marketplace = await Marketplace.deploy(1);
  const nft = await NFT.deploy();

  saveFrontendFiles(nft, 'NFT');
  saveFrontendFiles(marketplace, 'Marketplace');
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
