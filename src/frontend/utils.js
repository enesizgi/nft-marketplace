import { ethers } from "ethers";

export const classNames = (classes) => {
  let str = '';
  if (typeof classes === 'object') {
    Object.entries(classes).forEach(([key, value]) => {
      if (value) str += ` ${key}`;
    });
  }
  return str.trim();
};

export const generateSignatureData = async (message = 'NFTAO') => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []) // connects MetaMask
  const signer = provider.getSigner()
  const signature = await signer.signMessage(message);
  return { signature, message };
};