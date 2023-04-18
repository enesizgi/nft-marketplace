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
      ({ endpoint, qs = {}, headers, body, timeout }) => {
        const fetchMethod = timeout ? this.fetchWithTimeout(timeout) : fetch;

        return fetchMethod(`${this.baseURL}${endpoint}${this.createQs(qs)}`, {
          method: type,
          ...(headers && { headers }),
          ...(body && { body })
        })
          .then(response => response.json())
          .catch(error => {
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

  getFromIPFS = async (cid, timeout) => this.getRequest({ endpoint: '/get-from-ipfs', qs: { cid }, timeout });

  uploadToIPFS = async (metadata, formData) => this.postRequest({ endpoint: '/upload-to-ipfs', qs: { metadata }, body: formData });

  getUserSlug = async id => this.getRequest({ endpoint: '/user/slug', qs: { id } });

  getUsername = async id => this.getRequest({ endpoint: '/user/name', qs: { id } });

  getUserIdFromSlug = async slug => this.getRequest({ endpoint: '/user/id', qs: { slug } });

  getProfilePhoto = async id => this.getRequest({ endpoint: '/user/profile-photo', qs: { id } });

  getCoverPhoto = async id => this.getRequest({ endpoint: '/user/cover-photo', qs: { id } });

  uploadProfilePhoto = async (id, signature, message, formData) =>
    this.postRequest({
      endpoint: '/user/upload-profile-photo',
      qs: { id, signature, message },
      body: formData
    });

  uploadCoverPhoto = async (id, signature, message, formData) =>
    this.postRequest({
      endpoint: '/user/upload-cover-photo',
      qs: { id, signature, message },
      body: formData
    });

  checkUser = async id =>
    this.getRequest({
      endpoint: '/user/check',
      qs: { id }
    });

  createUser = async (id, signature, message) =>
    this.postRequest({
      endpoint: '/user/create',
      qs: { id, signature, message }
    });

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

  getNftStatus = async qs => this.getRequest({ endpoint: '/nftStatus', qs });

  getNftCount = async qs => this.getRequest({ endpoint: '/nftStatus/count', qs });

  getETHUSDPrice = async () => this.getRequest({ endpoint: '/price/ethereum/usd' });

  getUserFavorites = async id => this.getRequest({ endpoint: '/user/favorites', qs: { id } });

  getUserCart = async id => this.getRequest({ endpoint: '/user/cart', qs: { id } });

  setUserFavorites = async (id, favorites) =>
    this.postRequest({
      endpoint: '/user/favorites',
      body: JSON.stringify({ favorites, id }),
      headers: { 'Content-Type': 'application/json' }
    });

  setCart = async (id, cart) =>
    this.postRequest({
      endpoint: '/user/cart',
      body: JSON.stringify({ cart, id }),
      headers: { 'Content-Type': 'application/json' }
    });

  getNft = async ({ tokenId, cid }) =>
    this.getRequest({
      endpoint: '/nft',
      qs: { ...(tokenId && { tokenId }), ...(cid && { cid }) }
    });

  setTokenId = async (cid, tokenId) =>
    this.postRequest({
      endpoint: '/nft/tokenId',
      body: JSON.stringify({ tokenId }),
      qs: { cid },
      headers: { 'Content-Type': 'application/json' }
    });
}

export default new API();
