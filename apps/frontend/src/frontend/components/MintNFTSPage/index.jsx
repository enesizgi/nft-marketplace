import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FormLabel, Input, Switch } from '@chakra-ui/react';
import { ethers } from 'ethers';
import API from '../../modules/api';
import { getChainId, getMarketplaceContract, getNFTContract, getUserId } from '../../store/selectors';
import ScMintNFTSPage from './ScMintNFTSPage';
import { classNames } from '../../utils';
import { setToast } from '../../store/uiSlice';
import LoadingSpinner from '../LoadingSpinner';
import NFTMinted from './NFTMinted';
import Button from '../Button';

// TODO: add form control and image removal
const MintNFTSPage = () => {
  const [image, setImage] = useState('');
  const [price, setPrice] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [willBeListed, setWillBeListed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [randomReady, setRandomReady] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenId, setTokenId] = useState('');

  const fileUploadRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userId = useSelector(getUserId);
  const marketplaceContract = useSelector(getMarketplaceContract);
  const nftContract = useSelector(getNFTContract);
  const chainId = useSelector(getChainId);

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
    const { cid } = result;
    const uri = `ipfs://${cid}`;
    // mint nft
    const response = await (await nftContract.mintNFT(uri)).wait();
    const { tokenId: _tokenId } = response.events[0].args;
    setTokenId(_tokenId);
    await API.setTokenId(cid, _tokenId.toNumber(), nftContract.address, chainId);
    // get tokenId of new nft
    return cid;
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
    setIsLoading(true);
    setIsSuccess(false);
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
        await mintThenList(response);
      } else {
        await mintNFT(response);
      }
      setIsSuccess(true);
    } catch (error) {
      dispatch(
        setToast({
          title: 'NFT cannot be created.',
          duration: 5000,
          status: 'error'
        })
      );
      console.warn('ipfs uri upload error: ', error);
    }
    setIsLoading(false);
  };

  const getRandomNFT = async () => {
    setRandomReady(false);
    const response = await API.getRandomNFT();
    const imageResponse = await fetch(response.image);
    const blob = await imageResponse.blob();
    const url = URL.createObjectURL(blob);
    const imageFile = new File([blob], 'image.jpg', { type: 'image/jpeg' });
    setName('NFTAO');
    setDescription('Randomly generated NFT by NFTAO');
    setImage(url);
    setFile(imageFile);
    setRandomReady(true);
  };

  const handleGoToDetails = () => {
    navigate(`/nft/${nftContract.address}/${tokenId.toString()}`);
  };

  const NFTDropContent = useCallback(() => {
    if (!randomReady) {
      return <LoadingSpinner message="Generating a random NFT" />;
    }
    if (image) {
      return <img src={image} alt="nft-input" className="nftImage" />;
    }
    return (
      <>
        <span className="drop-title">Upload Your NFT</span>
        <Button className="uploadButton" onClick={handleOpenFileUpload}>
          Choose a File
        </Button>
        <input type="file" id="images" onChange={uploadToIPFS} accept="image/*" style={{ display: 'none' }} ref={fileUploadRef} />
      </>
    );
  }, [image, randomReady]);

  if (isLoading) {
    return (
      <div style={{ width: '100%', height: 'calc(100% - 100px)' }}>
        <LoadingSpinner message="Creating NFT" />
      </div>
    );
  }
  if (isSuccess) {
    return <NFTMinted price={price} name={name} image={image} onGoToDetails={handleGoToDetails} />;
  }

  return (
    <ScMintNFTSPage className="mintContainer">
      <label htmlFor="images" className={classNames({ 'drop-container': true, withImage: !!image })}>
        <NFTDropContent />
      </label>
      <div className="formContainer">
        <Button className={classNames({ 'random-button': true, outline: true })} onClick={getRandomNFT}>
          Give me a random NFT
        </Button>
        <FormLabel className="input-flat" htmlFor="name">
          Name
        </FormLabel>
        <Input id="name" type="text" onChange={e => setName(e.target.value)} value={name} placeholder="Name" className="input-control" />
        <FormLabel className="input-flat" htmlFor="description">
          Description
        </FormLabel>
        <Input
          id="description"
          type="text"
          onChange={e => setDescription(e.target.value)}
          value={description}
          placeholder="Description"
          className="input-control"
        />
        <div className="listSwitch">
          <FormLabel htmlFor="list">List Item In Marketplace</FormLabel>
          <Switch onChange={() => setWillBeListed(!willBeListed)} isChecked={willBeListed} colorScheme="linkedin" id="list" size="lg" />
        </div>
        {willBeListed && (
          <>
            <FormLabel htmlFor="price" className="input-flat">
              Price
            </FormLabel>
            <Input id="price" type="number" onChange={e => setPrice(e.target.value)} placeholder="Price in ETH" className="input-control" />
          </>
        )}
        <Button className="mint-nft-button" onClick={createNFT}>
          Mint NFT
        </Button>
      </div>
    </ScMintNFTSPage>
  );
};

export default MintNFTSPage;
