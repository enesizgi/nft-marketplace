/* eslint-disable react/prop-types */
// TODO @Enes: Remove this eslint disable
import React, { useState } from 'react';
import { ethers } from 'ethers';
import API from '../modules/api';

const MintNFTSPage = ({ nft, marketplace }) => {
  const [image, setImage] = useState(''); // eslint-disable-line
  const [price, setPrice] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const uploadToIPFS = async (e) => {
    e.preventDefault();
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  const mintThenList = async (result) => { // eslint-disable-line
    const uri = `ipfs://${result.cid}`;
    // mint nft
    await (await nft.mintNFT(uri)).wait();
    // get tokenId of new nft
    const id = await nft.tokenCounter();
    // approve marketplace to spend nft
    await (await nft.setApprovalForAll(marketplace.address, true)).wait();
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString());
    await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();
  };
  const createNFT = async () => {
    if (!file || !price || !name || !description) return;
    try {
      const formData = new FormData();
      formData.append('files', file);
      const metadata = JSON.stringify({
        price, name, description
      });
      const response = await API.uploadToIPFS(metadata, formData);
      setImage(response);
      mintThenList(response);
    } catch (error) {
      console.warn('ipfs uri upload error: ', error);
    }
  };
  return (
    <div className="mintContainer">
      <input type="file" onChange={uploadToIPFS} name="file" />
      <input type="text" onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input type="text" onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <input type="number" onChange={(e) => setPrice(e.target.value)} placeholder="Price in ETH" />
      <button type='button' onClick={createNFT}>Mint NFT</button>
      {image && <img src={image.url} alt='nft-input' width="300px" />}
    </div>
  );
};

export default MintNFTSPage;
