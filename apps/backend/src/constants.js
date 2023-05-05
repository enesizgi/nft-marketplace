import * as dotenv from 'dotenv';

dotenv.config();
const { API_HOST } = process.env;
export const apiBaseURL = API_HOST || 'localhost:3001';
export const isApiLocalhost = apiBaseURL.includes('localhost');
export const apiProtocol = isApiLocalhost ? 'http' : 'https';
export const SHOPPING_LIST_TYPES = { CART: 'CART', FAVORITES: 'FAVORITES' };
