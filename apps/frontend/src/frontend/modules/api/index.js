import { signatureGenerator } from '../../utils';

export const baseURL = window.location.href.includes('localhost') ? 'http://localhost:3001' : 'https://api.enesizgi.me';

class API {
  constructor() {
    this.baseURL = baseURL;

    this.fetchWithTimeout = timeout => async resource => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(resource, {
        ...timeout,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    };

    this.baseRequest =
      type =>
      ({ endpoint, qs = {}, headers, body, timeout, responseType = 'json', throwError = false, absoluteURL = false }) => {
        const fetchMethod = timeout ? this.fetchWithTimeout(timeout) : fetch;

        const url = absoluteURL ? endpoint : `${this.baseURL}${endpoint}`;
        return fetchMethod(`${url}${this.createQs(qs)}`, {
          method: type,
          ...(headers && { headers }),
          ...(body && { body })
        })
          .then(response => (responseType === 'raw' ? response : response.json()))
          .catch(error => {
            if (throwError) throw new Error(error);
            console.warn(`Request to ${endpoint} returned ${error}.`);
            return null;
          });
      };

    this.getRequest = this.baseRequest('GET');
    this.putRequest = this.baseRequest('PUT');
    this.deleteRequest = this.baseRequest('DELETE');
    this.postRequest = this.baseRequest('POST');
  }

  createQs = qs => {
    const keys = Object.keys(qs);
    if (keys.length === 0) {
      return '';
    }
    let str = '?';
    keys.forEach(key => {
      str = str.concat(`${key}=${qs[key]}&`);
    });
    return str.slice(0, -1);
  };

  getFromIPFS = async (cid, timeout) => this.getRequest({ endpoint: '/ipfs', qs: { cid }, timeout });

  uploadToIPFS = async (metadata, formData, responseType = 'json') =>
    this.postRequest({ endpoint: '/ipfs/upload', qs: { metadata }, body: formData, responseType });

  getUserSlug = async id => this.getRequest({ endpoint: '/user/slug', qs: { id } });

  getUsername = async id => this.getRequest({ endpoint: '/user/name', qs: { id } });

  getUserIdFromSlug = async slug => this.getRequest({ endpoint: '/user/id', qs: { slug } });

  getProfilePhoto = async id => this.getRequest({ endpoint: '/user/profile-photo', qs: { id } });

  getCoverPhoto = async id => this.getRequest({ endpoint: '/user/cover-photo', qs: { id } });

  uploadProfilePhoto = async (id, formData) => {
    const { signature, message } = await signatureGenerator.generateSignatureData();
    return this.postRequest({
      endpoint: '/user/upload-profile-photo',
      qs: { id, signature, message },
      body: formData
    });
  };

  uploadCoverPhoto = async (id, formData) => {
    const { signature, message } = await signatureGenerator.generateSignatureData();
    return this.postRequest({
      endpoint: '/user/upload-cover-photo',
      qs: { id, signature, message },
      body: formData
    });
  };

  createUser = async id => {
    const { signature, message } = await signatureGenerator.generateSignatureData();
    return this.postRequest({
      endpoint: '/user/create',
      qs: { id, signature, message }
    });
  };

  getUser = async id =>
    this.getRequest({
      endpoint: '/user',
      qs: { id }
    });

  getUserBySlug = async slug =>
    this.getRequest({
      endpoint: '/user',
      qs: { slug }
    });

  bulkUpdateUser = async (qs, payload) =>
    this.postRequest({
      endpoint: '/user/bulkUpdate',
      qs,
      body: payload
    });

  getEvents = async qs => this.getRequest({ endpoint: '/events', qs });

  syncEvents = async qs => this.getRequest({ endpoint: '/events/sync', qs });

  getOffers = async tokenId => this.getRequest({ endpoint: '/offers', qs: { tokenId } });

  createOffer = async qs => this.postRequest({ endpoint: '/offers/create', qs });

  deleteOffer = async qs => this.postRequest({ endpoint: '/offers/delete', qs });

  deleteAcceptedOffers = async qs => this.postRequest({ endpoint: '/offers/deleteAccepted', qs });

  getBids = async tokenId => this.getRequest({ endpoint: '/bids', qs: { tokenId } });

  createBid = async qs => this.postRequest({ endpoint: '/bids/create', qs });

  deleteBid = async qs => this.postRequest({ endpoint: '/bids/delete', qs });

  deleteBidsOfNft = async qs => this.postRequest({ endpoint: '/bids/deleteNft', qs });

  getNftStatus = async qs => this.getRequest({ endpoint: '/nftStatus', qs });

  getNftCount = async qs => this.getRequest({ endpoint: '/nftStatus/count', qs });

  getETHUSDPrice = async () => this.getRequest({ endpoint: '/price/ethereum/usd' });

  getShoppingLists = async (id, chainId) => {
    const { signature, message } = await signatureGenerator.generateSignatureData();
    return this.getRequest({ endpoint: '/shopping', qs: { signature, message, id, chainId } });
  };

  setUserFavorites = async (id, chainId, favorites) => {
    const { signature, message } = await signatureGenerator.generateSignatureData();
    return this.postRequest({
      endpoint: '/shopping/favorites',
      qs: { signature, message, id, chainId },
      body: JSON.stringify({ favorites }),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  setCart = async (id, chainId, cart) => {
    const { signature, message } = await signatureGenerator.generateSignatureData();
    return this.postRequest({
      endpoint: '/shopping/cart',
      qs: { signature, message, id, chainId },
      body: JSON.stringify({ cart }),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  getNft = async ({ tokenId, nftContract, network, cid }) =>
    this.getRequest({
      endpoint: '/nft',
      qs: { ...(tokenId && { tokenId }), ...(nftContract && { nftContract }), ...(network && { network }), ...(cid && { cid }) }
    });

  setTokenId = async (cid, tokenId, nftContract, network) =>
    this.postRequest({
      endpoint: '/nft/tokenId',
      body: JSON.stringify({ tokenId, nftContract, network }),
      qs: { cid },
      headers: { 'Content-Type': 'application/json' }
    });

  search = async qs => this.getRequest({ endpoint: '/search', qs });

  getRandomNFT = async ({ timeout, responseType, throwError }) => this.getRequest({ endpoint: '/nft/random', timeout, responseType, throwError });
}

export default new API();
