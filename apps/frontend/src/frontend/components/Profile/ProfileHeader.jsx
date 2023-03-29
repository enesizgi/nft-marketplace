import React from 'react';
import { string } from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { setUserProfilePhoto, setUserCoverPhoto, setSignedMessage } from '../../store/userSlice';
import API from '../../modules/api';
import ScProfileHeader from './ScProfileHeader';
import ImageUpload from '../ImageUpload';
import { ReactComponent as DefaultProfilePhoto } from '../../assets/default-profile-photo.svg';
import { ReactComponent as EditIcon } from '../../assets/edit-icon.svg';
import { generateSignatureData } from '../../utils';
import { getIsProfileOwner, getProfile, getSignedMessage } from '../../store/selectors';
import { initProfile } from '../../store/actionCreators';
import Button from '../Button';
import { setActiveModal } from '../../store/uiSlice';
import { MODAL_TYPES } from '../../constants';

const ProfileHeader = ({ id }) => {
  const dispatch = useDispatch();
  const isProfileOwner = useSelector(getIsProfileOwner);
  const profile = useSelector(getProfile);
  const { name: username, profilePhoto, coverPhoto } = profile;
  const signedMessage = useSelector(getSignedMessage);

  const updateSignedMessage = (signature, message) => {
    if (signedMessage?.signature !== signature) {
      localStorage.setItem('signature', signature);
      localStorage.setItem('signedMessage', message);
      dispatch(setSignedMessage({ signature, message }));
    }
  };
  const handleCoverPhotoUpload = async e => {
    e.preventDefault();
    const { signature, message } = await generateSignatureData(signedMessage);
    updateSignedMessage(signature, message);
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('cover-photo', file);
        const response = await API.uploadCoverPhoto(id, signature, message, formData);
        dispatch(setUserCoverPhoto(response.url));
        dispatch(initProfile(id));
        return response.url;
      } catch (error) {
        console.warn('Error on uploading file', error);
      }
    }
    return null;
  };

  const handleProfilePhotoUpload = async e => {
    e.preventDefault();
    const { signature, message } = await generateSignatureData(signedMessage);
    updateSignedMessage(signature, message);
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('profile-photo', file);
        const response = await API.uploadProfilePhoto(id, signature, message, formData);
        dispatch(setUserProfilePhoto(response.url));
        dispatch(initProfile(id));
        return response.url;
      } catch (error) {
        console.warn('Error on uploading file', error);
      }
    }
    return null;
  };

  const openEditModal = () => {
    dispatch(setActiveModal({ type: MODAL_TYPES.PROFILE_EDIT, props: { profile, updateSignedMessage } }));
  };

  return (
    <ScProfileHeader>
      <div className="profile-photos">
        {isProfileOwner && (
          <Button type="button" className="profile-names-edit" onClick={openEditModal}>
            <EditIcon />
            Edit Profile
          </Button>
        )}
        <div className="cover-photo">
          {isProfileOwner && <ImageUpload onUpload={handleCoverPhotoUpload} />}
          {coverPhoto && <img className="cover-photo-image" alt="coverPhoto" src={coverPhoto} />}
        </div>
        <div className="profile-photo">
          {isProfileOwner && <ImageUpload onUpload={handleProfilePhotoUpload} />}
          {profilePhoto ? (
            <img className="profile-photo-image" alt="profilePhoto" src={profilePhoto} />
          ) : (
            <DefaultProfilePhoto className="profile-photo-default" />
          )}
        </div>
      </div>
      <div className="profile-names">
        <h1 className="profile-names-name">{username}</h1>
        <h2 className="profile-names-id">@{id}</h2>
      </div>
    </ScProfileHeader>
  );
};

ProfileHeader.propTypes = {
  id: string
};

ProfileHeader.defaultProps = {
  id: ''
};

export default ProfileHeader;
