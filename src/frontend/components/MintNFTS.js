/* eslint-disable react/prop-types */

// TODO @Enes: Remove this eslint disable
import React, { useState } from 'react';
import { ethers } from 'ethers';
import API from '../modules/api';
import './MintNFTS.css';

const MintNFTSPage = ({ account, nft, marketplace }) => {
  const [image, setImage] = useState(''); // eslint-disable-line
  const [price, setPrice] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const uploadToIPFS = async e => {
    e.preventDefault();
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const mintNFT = async result => {
    const uri = `ipfs://${result.cid}`;
    // mint nft
    const response = await (await nft.mintNFT(uri)).wait();
    // get tokenId of new nft
    return response.events[0].args[2];
  };

  const mintThenList = async result => {
    const id = await mintNFT(result);

    // approve marketplace to spend nft
    const isApproved = await nft.isApprovedForAll(account, marketplace.address);
    if (!isApproved) {
      await (await nft.setApprovalForAll(marketplace.address, true)).wait();
    }
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString());
    await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();
  };
  const createNFT = willBeListed => async () => {
    if (!file || !price || !name || !description) return;
    try {
      const formData = new FormData();
      formData.append('files', file);
      const metadata = JSON.stringify({
        price,
        name,
        description
      });
      const response = await API.uploadToIPFS(metadata, formData);
      setImage(response);
      if (willBeListed) {
        mintThenList(response);
      } else {
        mintNFT(response);
      }
    } catch (error) {
      console.warn('ipfs uri upload error: ', error);
    }
  };

  return (
    <div className="mintContainer">
      <label htmlFor="images" className="drop-container">
        <span className="drop-title">Upload your NFT</span>
        <input type="file" id="images" name="file" onChange={uploadToIPFS} accept="image/*" required />
      </label>

      <div className="container">
        <div className="input-group">
          <div className="input-flat">Name</div>
          <input type="text" onChange={e => setName(e.target.value)} placeholder="Name" className="input-control" />
        </div>
        <div className="input-group">
          <div className="input-flat">Description</div>
          <input type="text" onChange={e => setDescription(e.target.value)} placeholder="Description" className="input-control" />
        </div>
        <div className="input-group">
          <div className="input-flat">Price</div>
          <input type="number" onChange={e => setPrice(e.target.value)} placeholder="Price in ETH" className="input-control" />
        </div>
      </div>
      <div className="buttonContainer">
        <button type="button" className="button-37" onClick={createNFT(false)}>
          Mint NFT
        </button>
        <button type="button" className="button-37 isGreen" onClick={createNFT(true)}>
          Mint and List
        </button>
      </div>
      {image && <img src={image.url} alt="nft-input" width="300px" />}
    </div>
  );
};

export default MintNFTSPage;
