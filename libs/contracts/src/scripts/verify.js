import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import { readFile } from 'fs/promises';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();
const execPromise = promisify(exec);

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const network = process.env.HARDHAT_NETWORK || 'goerli';

const main = async () => {
  const contractsDir = `${dirname}/../contractsData/${network}`;
  const nftAddress = JSON.parse(await readFile(`${contractsDir}/NFT-address.json`)).address;
  const marketplaceAddress = JSON.parse(await readFile(`${contractsDir}/Marketplace-address.json`)).address;
  try {
    const { stdout } = await execPromise(`env $(cat ../../../../.env) npx hardhat verify --network ${network} ${nftAddress}`);
    console.log(stdout);
  } catch (error) {
    console.log('Error:', error);
  }
  try {
    const { stdout } = await execPromise(`env $(cat ../../../../.env) npx hardhat verify --network ${network} ${marketplaceAddress} 1`);
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
