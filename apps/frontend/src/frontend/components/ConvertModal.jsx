import React, { useState } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { Button, FormLabel, Input } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { getButtonSize, getUserId, getwETHContract } from '../store/selectors';
import LoadingSpinner from './LoadingSpinner';
import { setActiveModal } from '../store/uiSlice';

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
  const buttonSize = useSelector(getButtonSize);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleConvertToWETH = async () => {
    setLoading(true);
    await wETHContract.balanceOf(userId);
    await wETHContract.wrap({ value: ethers.utils.parseEther(amount) });
    await wETHContract.balanceOf(userId);
    setLoading(false);
    dispatch(setActiveModal(''));
  };

  const handleConvertToETH = async () => {
    setLoading(true);
    await wETHContract.unwrap(ethers.utils.parseEther(amount));
    setLoading(false);
    dispatch(setActiveModal(''));
  };

  if (loading) {
    return <LoadingSpinner message="Converting..." />;
  }

  return (
    <ScConvertModal>
      <FormLabel className="amount-label" htmlFor="amount">
        Select Amount:
      </FormLabel>
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
