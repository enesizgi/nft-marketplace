const dotenv = require('dotenv');

dotenv.config();
const { API_HOST } = process.env;
const apiBaseURL = API_HOST ?? 'localhost:3001';

module.exports = apiBaseURL;
