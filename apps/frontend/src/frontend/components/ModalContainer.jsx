import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getActiveModal, getDeviceType, getLoadingInfo } from '../store/selectors';
import SellModal from './NFTDetailPage/SellModal';
import Modal from './Modal';
import { DEVICE_TYPES, MODAL_TYPES } from '../constants';
import { setActiveModal } from '../store/uiSlice';
import ProfileEditModal from './Profile/ProfileEditModal';
import OfferModal from './NFTDetailPage/OfferModal';

const MODAL_COMPONENTS = {
  [MODAL_TYPES.SELL]: SellModal,
  [MODAL_TYPES.IMAGE_PREVIEW]: ({ ...props }) => <img alt="previewImage" {...props} />,
  [MODAL_TYPES.PROFILE_EDIT]: ProfileEditModal,
  [MODAL_TYPES.OFFER]: OfferModal
};

const ModalContainer = () => {
  const { type, props } = useSelector(getActiveModal);
  const deviceType = useSelector(getDeviceType);
  const loadingInfo = useSelector(getLoadingInfo);

  const dispatch = useDispatch();

  const ActiveComponent = MODAL_COMPONENTS[type];

  if (!ActiveComponent) {
    return null;
  }

  return (
    <Modal loadingInfo={loadingInfo} onClose={() => dispatch(setActiveModal(''))} fullPage={deviceType === DEVICE_TYPES.MOBILE}>
      <ActiveComponent {...props} />
    </Modal>
  );
};

export default ModalContainer;
