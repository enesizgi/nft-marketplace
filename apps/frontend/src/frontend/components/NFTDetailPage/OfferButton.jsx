import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from '../Button';
import { setActiveModal } from '../../store/uiSlice';
import { MODAL_TYPES } from '../../constants';
import { getTokenId } from '../../store/selectors';

const OfferButton = () => {
  const dispatch = useDispatch();
  const tokenId = useSelector(getTokenId);

  return (
    <Button colorScheme="blue" onClick={() => dispatch(setActiveModal({ type: MODAL_TYPES.OFFER, props: { tokenId } }))}>
      {' '}
      Make Offer{' '}
    </Button>
  );
};
export default OfferButton;
