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

  // eslint-disable-next-line no-restricted-syntax
  for await (const contractData of [
    { name: 'NFT', args: [] },
    { name: 'Marketplace', args: [1] },
    { name: 'wETH', args: [] }
  ]) {
    const contractAddress = JSON.parse(await readFile(`${contractsDir}/${contractData.name}-address.json`)).address;
    try {
      const { stdout } = await execPromise(
        `env $(cat ../../../../.env) npx hardhat verify --network ${network} ${contractAddress} ${contractData.args.join(' ')}`
      );
      console.log(stdout);
    } catch (error) {
      console.log('Error:', error);
    }
  }
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
