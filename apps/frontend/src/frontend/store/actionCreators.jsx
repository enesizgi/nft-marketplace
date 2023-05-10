export const initMarketplace = () => ({ type: 'INIT_MARKETPLACE' });

export const initProfile = path => ({ type: 'INIT_PROFILE', payload: path });

export const initNFT = tokenId => ({ type: 'INIT_NFT', payload: tokenId });

export const updateFavorites = cid => ({ type: 'UPDATE_FAVORITES', payload: cid });

export const updateCart = cid => ({ type: 'UPDATE_CART', payload: cid });

export const setSearchTerm = searchTerm => ({ type: 'SET_SEARCH_TERM', payload: searchTerm });
