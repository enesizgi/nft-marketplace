const dotenv = require('dotenv');

dotenv.config();
const { API_HOST } = process.env;
const apiBaseURL = API_HOST ?? 'localhost:3001';
const isApiLocalhost = apiBaseURL.includes('localhost');
const apiProtocol = isApiLocalhost ? 'http' : 'https';

module.exports = { apiBaseURL, isApiLocalhost, apiProtocol };
