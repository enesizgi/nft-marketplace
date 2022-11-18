/* eslint-disable react/prop-types */
// TODO @Enes: Remove this eslint disable
import React, { useState } from 'react';
import { ethers } from 'ethers';

const MintNFTSPage = ({ nft, marketplace }) => {
  const [image, setImage] = useState('');
  const [price, setPrice] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const uploadToIPFS = async (e) => {
    e.preventDefault();
    const img = {
      preview: URL.createObjectURL(e.target.files[0]),
      data: e.target.files[0],
    };
    const file = img.data;
    console.log(file);
    if (typeof file !== 'undefined') {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const result = await fetch('http://localhost:3001/upload-to-ipfs', {
          method: 'POST',
          body: formData
        });
        const response = await result.json();
        // setImage(`https://ipfs.infura.io/ipfs/${result.path}`);
        // console.log('https://ipfs.io/ipfs/' + response.path);
        setImage(response);
      } catch (error) {
        console.log('ipfs image upload error: ', error);
      }
    }
  };
  const mintThenList = async (result) => {
    const uri = result.path;
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
    if (Object.keys(image).length === 0 || !price || !name || !description) return;
    try {
      const result = await fetch('http://localhost:3001/upload-metadata-to-ipfs', {
        method: 'POST',
        body: JSON.stringify({
          image, price, name, description
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const response = await result.json();
      console.log(response);
      // const result = await client.add(JSON.stringify({image, price, name, description}))
      mintThenList(response);
    } catch (error) {
      console.log('ipfs uri upload error: ', error);
    }
  };
  /* eslint-disable jsx-a11y/alt-text,react/button-has-type */
  return (
    <div className="mintContainer">
      <input type="file" onChange={uploadToIPFS} name="file" />
      <input type="text" onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input type="text" onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <input type="number" onChange={(e) => setPrice(e.target.value)} placeholder="Price in ETH" />
      <button onClick={createNFT}>Mint NFT</button>
      {image && <img src={`data:${image.data.mimetype};base64,${image.data.data}`} width="300px" />}
    </div>
  );
};

export default MintNFTSPage;
