import { ethers } from 'ethers';

export const classNames = classes => {
  let str = '';
  if (typeof classes === 'object') {
    Object.entries(classes).forEach(([key, value]) => {
      if (value) str += ` ${key}`;
    });
  }
  return str.trim();
};

export const generateSignatureData = async (signedMessage = null, message = 'NFTAO') => {
  if (signedMessage) {
    const messageCreationDate = new Date(signedMessage.message.split(' ').pop());
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    if (messageCreationDate > oneDayAgo) {
      return signedMessage;
    }
  }
  const date = new Date().toISOString();
  const messageWithDate = `${message} ${date}`;
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []); // connects MetaMask
  const signer = provider.getSigner();
  const signature = await signer.signMessage(messageWithDate);
  return { signature, message: messageWithDate };
};

export const serializeBigNumber = obj =>
  Object.entries(obj).reduce(
    (acc, [key, value]) => (ethers.BigNumber.isBigNumber(value) ? { ...acc, [key]: parseInt(value._hex, 16) } : { ...acc, [key]: value }),
    {}
  );

export const compare = (s1, s2) => s1 && s2 && s1.toLowerCase() === s2.toLowerCase();
