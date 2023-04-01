import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, FormLabel, Input, Switch } from '@chakra-ui/react';
import { ethers } from 'ethers';
import API from '../../modules/api';
import { getMarketplaceContract, getNFTContract, getUserId } from '../../store/selectors';
import ScMintNFTSPage from './ScMintNFTSPage';
import { classNames } from '../../utils';

// TODO: add form control and image removal
const MintNFTSPage = () => {
  const [image, setImage] = useState('');
  const [price, setPrice] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [willBeListed, setWillBeListed] = useState(false);
  const fileUploadRef = useRef();

  const userId = useSelector(getUserId);
  const marketplaceContract = useSelector(getMarketplaceContract);
  const nftContract = useSelector(getNFTContract);

  const handleOpenFileUpload = () => {
    fileUploadRef.current?.click();
  };

  const uploadToIPFS = async e => {
    e.preventDefault();
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      const url = URL.createObjectURL(e.target.files[0]);
      setImage(url);
    }
  };

  const mintNFT = async result => {
    const uri = `ipfs://${result.cid}`;
    // mint nft
    const response = await (await nftContract.mintNFT(uri)).wait();
    // get tokenId of new nft
    return response.events[0].args[2];
  };

  const mintThenList = async result => {
    const id = await mintNFT(result);

    // approve marketplace to spend nft
    const isApproved = await nftContract.isApprovedForAll(userId, marketplaceContract.address);
    if (!isApproved) {
      await (await nftContract.setApprovalForAll(marketplaceContract.address, true)).wait();
    }
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString());
    await (await marketplaceContract.makeItem(nftContract.address, id, listingPrice)).wait();
  };
  const createNFT = async () => {
    if (willBeListed && !price) return;
    if (!file || !name || !description) return;
    try {
      const formData = new FormData();
      formData.append('files', file);
      const metadata = JSON.stringify({
        name,
        description
      });
      const response = await API.uploadToIPFS(metadata, formData);
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
    <ScMintNFTSPage className="mintContainer">
      <label htmlFor="images" className={classNames({ 'drop-container': true, withImage: !!image })}>
        {image ? (
          <img src={image} alt="nft-input" className="nftImage" />
        ) : (
          <>
            <span className="drop-title">Upload Your NFT</span>
            <Button colorScheme="linkedin" className="uploadButton" onClick={handleOpenFileUpload}>
              Choose a File
            </Button>
            <input type="file" id="images" onChange={uploadToIPFS} accept="image/*" style={{ display: 'none' }} ref={fileUploadRef} />
          </>
        )}
      </label>
      <div className="formContainer">
        <FormLabel className="input-flat" htmlFor="name">
          Name
        </FormLabel>
        <Input id="name" type="text" onChange={e => setName(e.target.value)} placeholder="Name" className="input-control" />
        <FormLabel className="input-flat" htmlFor="description">
          Description
        </FormLabel>
        <Input id="description" type="text" onChange={e => setDescription(e.target.value)} placeholder="Description" className="input-control" />
        <FormLabel htmlFor="price" className="input-flat">
          Price
        </FormLabel>
        <Input id="price" type="number" onChange={e => setPrice(e.target.value)} placeholder="Price in ETH" className="input-control" />
        <div className="listSwitch">
          <FormLabel htmlFor="list">List Item In Marketplace</FormLabel>
          <Switch onChange={() => setWillBeListed(!willBeListed)} isChecked={willBeListed} colorScheme="linkedin" id="list" size="lg" />
        </div>
        <Button size="lg" colorScheme="linkedin" onClick={createNFT}>
          Mint NFT
        </Button>
      </div>
    </ScMintNFTSPage>
  );
};

export default MintNFTSPage;
