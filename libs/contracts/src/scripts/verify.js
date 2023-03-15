import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import { readFile } from 'fs/promises';
import * as dotenv from 'dotenv';

dotenv.config();
const execPromise = promisify(exec);

const main = async () => {
  const nftAddress = JSON.parse(await readFile('../contractsData/goerli/NFT-address.json')).address;
  const marketplaceAddress = JSON.parse(await readFile('../contractsData/goerli/Marketplace-address.json')).address;
  try {
    const { stdout } = await execPromise(`env $(cat ../../../../.env) npx hardhat verify --network goerli ${nftAddress}`);
    console.log(stdout);
  } catch (error) {
    console.log('Error:', error);
  }
  try {
    const { stdout } = await execPromise(`env $(cat ../../../../.env) npx hardhat verify --network goerli ${marketplaceAddress} 1`);
    console.log(stdout);
  } catch (error) {
    console.log('Error:', error);
  }
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
