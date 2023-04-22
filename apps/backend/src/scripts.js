import RandomNft from './models/randomNft';
import RandomNftData from './constants/random_nfts.json';

export const importRandomNfts = async () => {
  await RandomNft.deleteMany({});
  await RandomNft.insertMany(RandomNftData);
};
