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
import { ReactComponent as ResetIcon } from '../../assets/reset-icon.svg';

// TODO: add form control and image removal
// UPDATE from Enes: We can remove images by using reset button but removing only image would be nice. (Not so important though)
const MintNFTSPage = ({ reload }) => {
  const [image, setImage] = useState('');
  const [price, setPrice] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [willBeListed, setWillBeListed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [randomReady, setRandomReady] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenId, setTokenId] = useState('');

  const hasNFTInfo = image || name || description || price;

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

  const dispatchError = (errorMessage, duration = 5000) =>
    dispatch(
      setToast({
        title: errorMessage,
        duration,
        status: 'error'
      })
    );

  const checkForUserRejectedError = (error, message = 'User rejected transaction.') => {
    if (error.toString().includes('code=ACTION_REJECTED')) dispatchError(message);
  };

  const waitForTransaction = async transaction => {
    try {
      setLoadingMessage('Waiting for block confirmation...');
      return await transaction.wait();
    } catch (e) {
      console.error(e);
      dispatchError('Error happened while confirming transaction.');
      return null;
    }
  };

  const mintNFT = async result => {
    const { cid } = result;
    const uri = `ipfs://${cid}`;
    // mint nft
    let transaction;
    try {
      setLoadingMessage('Waiting for user confirmation...');
      transaction = await nftContract.mintNFT(uri);
    } catch (e) {
      checkForUserRejectedError(e, 'User rejected mint transaction.');
      console.error(e);
      return null;
    }
    const response = await waitForTransaction(transaction);
    if (response == null) return null;
    const { tokenId: _tokenId } = response.events[0].args;
    setTokenId(_tokenId);
    await API.setTokenId(cid, _tokenId.toNumber(), nftContract.address, chainId);
    // get tokenId of new nft
    return _tokenId;
  };

  const mintThenList = async result => {
    const id = await mintNFT(result);
    if (id == null) return null;

    // approve marketplace to spend nft
    const isApproved = await nftContract.isApprovedForAll(userId, marketplaceContract.address);
    if (!isApproved) {
      let transaction;
      try {
        setLoadingMessage('Waiting for user confirmation...');
        transaction = await nftContract.setApprovalForAll(marketplaceContract.address, true);
      } catch (e) {
        console.error(e);
        checkForUserRejectedError(e, 'User rejected approval transaction.');
        return null;
      }
      const response = await waitForTransaction(transaction);
      if (response == null) return null;
    }
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString());
    let transaction;
    try {
      setLoadingMessage('Waiting for user confirmation...');
      transaction = await marketplaceContract.makeItem(nftContract.address, id, listingPrice);
    } catch (e) {
      console.error(e);
      checkForUserRejectedError(e, 'User rejected listing transaction.');
      return null;
    }
    return waitForTransaction(transaction);
  };
  const createNFT = async () => {
    if (willBeListed) {
      if (!price) {
        dispatchError('Price cannot be empty.');
        return;
      }
      try {
        ethers.utils.parseEther(price.toString());
      } catch (e) {
        dispatchError('Invalid price');
        return;
      }
    }
    if (!name || !description) dispatchError('Name or description cannot be empty');
    if (!file) dispatchError('Upload a file or generate a random nft.');
    if (!name || !description || !file) return;
    setLoadingMessage('Creating NFT');
    setIsLoading(true);
    setIsSuccess(false);
    try {
      const formData = new FormData();
      formData.append('files', file);
      const metadata = JSON.stringify({
        name,
        description
      });
      let response = await API.uploadToIPFS(metadata, formData, 'raw');
      if (response.ok) {
        response = await response.json();
        let success;
        if (willBeListed) success = await mintThenList(response);
        else success = await mintNFT(response);
        if (success != null) setIsSuccess(true);
      } else dispatchError('Server error. Try again later.');
    } catch (error) {
      console.error(error);
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
    if (!name) setName('NFTAO');
    if (!description) setDescription('Randomly generated NFT by NFTAO');
    setImage(url);
    setFile(imageFile);
    setRandomReady(true);
  };

  const handleGoToDetails = () => {
    navigate(`/nft/${nftContract.address}/${tokenId.toString()}`);
  };

  const NFTDropContent = useCallback(() => {
    if (!randomReady) {
      setLoadingMessage('Generating a random NFT');
      return <LoadingSpinner message={loadingMessage} />;
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
  }, [loadingMessage, image, randomReady]);

  if (isLoading) {
    return (
      <div style={{ width: '100%', height: 'calc(100% - 100px)' }}>
        <LoadingSpinner message={loadingMessage} />
      </div>
    );
  }
  if (isSuccess) {
    return <NFTMinted price={price} name={name} image={image} onGoToDetails={handleGoToDetails} reload={reload} />;
  }

  return (
    <ScMintNFTSPage className="mintContainer">
      <label htmlFor="images" className={classNames({ 'drop-container': true, withImage: !!image })}>
        <NFTDropContent />
      </label>
      <div className="formContainer">
        <div className="randomButtons">
          <Button className={classNames({ 'random-button': true, outline: true })} onClick={getRandomNFT}>
            Generate random NFT
          </Button>
          {hasNFTInfo && (
            <button type="button" className="mint-nft-button" onClick={reload}>
              <ResetIcon />
            </button>
          )}
        </div>
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
