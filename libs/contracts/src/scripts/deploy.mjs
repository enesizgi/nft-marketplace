/* global artifacts */
/* eslint no-undef: "error" */
import hre from 'hardhat';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import Nft from '../models/nft.mjs';
import ShoppingList from '../models/shopping_list.mjs';
import User from '../models/user.mjs';

dotenv.config();

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const network = process.env.HARDHAT_NETWORK || 'localhost';

const saveFrontendFiles = (contract, name) => {
  const contractsDir = `${dirname}/../contractsData/${network}`;

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

  const contracts = [
    { name: 'Marketplace', args: [1] },
    { name: 'NFT', args: [] },
    { name: 'wETH', args: [] }
  ];
  let successfulDeploymentCount = 0;
  // eslint-disable-next-line no-restricted-syntax
  for await (const contractData of contracts) {
    let contractInstance;
    try {
      const contract = await hre.ethers.getContractFactory(contractData.name);
      contractInstance = await contract.deploy(...contractData.args);
      successfulDeploymentCount += 1;
    } catch (e) {
      console.error(e);
    }
    if (process.env.ETHERNAL_EMAIL && process.env.ETHERNAL_PASSWORD) {
      try {
        await hre.ethernal.push({
          name: contractData.name,
          address: contractInstance.address
        });
      } catch (e) {
        console.log('Error pushing to Ethernal', e);
      }
    }
    saveFrontendFiles(contractInstance, contractData.name);
  }
  if (network === 'localhost' && successfulDeploymentCount === contracts.length) {
    await mongoose.connect(process.env.MONGO_URI, {});
    await Nft.deleteMany({ network: '0x7a69' });
    await ShoppingList.deleteMany({ chainId: '0x7a69' });
    await User.updateMany({}, [{ $unset: 'cart' }, { $unset: 'favorites' }]);
  }
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
