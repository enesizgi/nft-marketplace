// eslint-disable-next-line import/prefer-default-export
export const initMarketplace = () => ({ type: 'INIT_MARKETPLACE' });

export const initProfile = path => ({ type: 'INIT_PROFILE', payload: path });

export const initNFT = tokenId => ({ type: 'INIT_NFT', payload: tokenId });
