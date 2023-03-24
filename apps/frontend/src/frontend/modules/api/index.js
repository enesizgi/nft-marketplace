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
      ({ endpoint, qs = {}, header, body, timeout }) => {
        const fetchMethod = timeout ? this.fetchWithTimeout(timeout) : fetch;

        return fetchMethod(`${this.baseURL}${endpoint}${this.createQs(qs)}`, {
          method: type,
          ...(header && { header }),
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

  getEvents = async qs => this.getRequest({ endpoint: '/events', qs });

  getNftStatus = async qs => this.getRequest({ endpoint: '/nftStatus', qs });

  getNftCount = async qs => this.getRequest({ endpoint: '/nftStatus/count', qs });

  getETHUSDPrice = async () => this.getRequest({ endpoint: '/price/ethereum/usd' });
}

export default new API();
