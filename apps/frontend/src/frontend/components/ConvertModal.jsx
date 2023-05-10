import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { Button, FormLabel, Input } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { getButtonSize, getProviderOrSigner, getUserId, getwETHContract } from '../store/selectors';
import LoadingSpinner from './LoadingSpinner';
import { setActiveModal } from '../store/uiSlice';
import { checkUserRejectedHandler, dispatchToastHandler, waitConfirmHandler, waitTransactionHandler } from './utils';

const ScConvertModal = styled.div`
  display: flex;
  flex-direction: column;

  .amount-label {
    align-self: flex-start;
    font-size: 24px;
    font-weight: 600;
  }
  .convert-buttons {
    margin-top: 30px;
    & > button {
      margin-right: 10px;
    }
  }
  > input {
    color: #fff;
    font-size: 18px;
  }
`;

const ConvertModal = () => {
  const wETHContract = useSelector(getwETHContract);
  const userId = useSelector(getUserId);
  const providerOrSigner = useSelector(getProviderOrSigner);
  const buttonSize = useSelector(getButtonSize);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [ethBalance, setEthBalance] = useState(0);
  const [wethBalance, setWethBalance] = useState(0);
  const dispatch = useDispatch();

  const dispatchToast = dispatchToastHandler(dispatch);
  const checkForUserRejectedError = checkUserRejectedHandler(dispatchToast);
  const waitForTransaction = waitTransactionHandler(setLoadingMessage, dispatchToast);

  const getBalances = useCallback(async () => {
    const [balanceWETH, balanceETH] = await Promise.all([wETHContract.balanceOf(userId), providerOrSigner.getBalance()]);
    setWethBalance(ethers.utils.formatEther(balanceWETH));
    setEthBalance(ethers.utils.formatEther(balanceETH));
  }, [providerOrSigner, userId, wETHContract]);

  useEffect(() => {
    getBalances();
    const intervalId = setInterval(getBalances, 2500);
    return () => {
      clearInterval(intervalId);
    };
  }, [getBalances]);

  const handleConvertToWETH = async () => {
    if (!amount) {
      dispatchToast('Amount should be valid.');
      return;
    }
    setLoadingMessage('Converting ETH to WETH...');
    setLoading(true);
    const waitForConfirm = waitConfirmHandler(async () => wETHContract.wrap({ value: ethers.utils.parseEther(amount) }), checkForUserRejectedError);
    const transaction = await waitForConfirm();
    if (transaction != null) {
      const result = await waitForTransaction(transaction);
      if (result != null) dispatch(setActiveModal(''));
    }
    setLoading(false);
  };

  const handleConvertToETH = async () => {
    if (!amount) {
      dispatchToast('Amount should be valid.');
      return;
    }
    setLoadingMessage('Converting WETH to ETH...');
    setLoading(true);
    const waitForConfirm = waitConfirmHandler(async () => wETHContract.unwrap(ethers.utils.parseEther(amount)), checkForUserRejectedError);
    const transaction = await waitForConfirm();
    if (transaction != null) {
      const result = await waitForTransaction(transaction);
      if (result != null) dispatch(setActiveModal(''));
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner message={loadingMessage} />;
  }

  return (
    <ScConvertModal>
      <FormLabel className="amount-label" htmlFor="amount">
        Select Amount:
      </FormLabel>
      <div style={{ color: 'white' }}>Your ETH Balance:{ethBalance}</div>
      <div style={{ color: 'white' }}>Your WETH Balance:{wethBalance}</div>
      <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
      <div className="convert-buttons">
        <Button colorScheme="linkedin" size={buttonSize} onClick={handleConvertToWETH}>
          ETH to WETH
        </Button>
        <Button colorScheme="linkedin" size={buttonSize} onClick={handleConvertToETH}>
          WETH to ETH
        </Button>
      </div>
    </ScConvertModal>
  );
};

export default ConvertModal;
