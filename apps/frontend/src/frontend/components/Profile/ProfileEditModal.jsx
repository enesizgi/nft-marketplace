import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Input, FormControl, FormLabel, Button } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { getDeviceType, getSignedMessage } from '../../store/selectors';
import { DEVICE_TYPES } from '../../constants';
import { setActiveModal } from '../../store/uiSlice';
import API from '../../modules/api';
import { initProfile } from '../../store/actionCreators';
import { setUser } from '../../store/userSlice';
import LoadingSpinner from '../LoadingSpinner';
import { generateSignatureData } from '../../utils';

const BUTTON_SIZE_MAP = {
  [DEVICE_TYPES.MOBILE]: 'sm',
  [DEVICE_TYPES.TABLET]: 'md',
  [DEVICE_TYPES.DESKTOP]: 'lg'
};

const ScProfileEditModal = styled(FormControl)`
  display: flex;
  flex-direction: column;

  input {
    margin-bottom: 20px;
  }
  label {
    font-weight: 600;
  }
  button {
    word-wrap: break-word;
    max-width: calc(50% - 20px);
  }
  .submitButton {
    margin-top: 20px;
    align-self: center;
  }

  .photoUpload-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .profilePhoto {
    display: inline;
    width: 200px;
    max-width: 50%;
    height: 200px;
    border-radius: 100%;
    margin-right: 20px;
    @media screen and (max-width: 768px) {
      width: 175px;
      height: 175px;
    }
    @media screen and (max-width: 480px) {
      width: 120px;
      height: 120px;
    }
  }
  .coverPhoto {
    margin-right: 20px;
    height: 200px;
    max-width: 50%;
    @media screen and (max-width: 768px) {
      height: 175px;
    }
    @media screen and (max-width: 480px) {
      height: 120px;
    }
  }
`;

const ProfileEditModal = ({ profile, updateSignedMessage }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [uploadedCoverPhoto, setUploadedCoverPhoto] = useState();
  const [uploadedProfilePhoto, setUploadedProfilePhoto] = useState();
  const profilePhotoUploadRef = useRef();
  const coverPhotoUploadRef = useRef();
  const dispatch = useDispatch();
  const deviceType = useSelector(getDeviceType);
  const signedMessage = useSelector(getSignedMessage);
  const handleOpenProfilePhotoUpload = () => {
    profilePhotoUploadRef.current?.click();
  };
  const handeOpenCoverPhotoUpload = () => {
    coverPhotoUploadRef.current?.click();
  };
  const handleProfilePhotoUpload = async e => {
    const file = e.target.files[0];
    setUploadedProfilePhoto(file);
    const url = URL.createObjectURL(file);
    setCurrentProfile({ ...profile, profilePhoto: url });
  };

  const handleCoverPhotoUpload = async e => {
    const file = e.target.files[0];
    setUploadedCoverPhoto(file);
    const url = URL.createObjectURL(file);
    setCurrentProfile({ ...profile, coverPhoto: url });
  };

  const handleSubmitData = async () => {
    setIsLoading(true);
    const { signature, message } = await generateSignatureData(signedMessage);
    updateSignedMessage(signature, message);
    const formData = new FormData();
    if (uploadedProfilePhoto) formData.append('profile-photo', uploadedProfilePhoto);
    if (uploadedCoverPhoto) formData.append('cover-photo', uploadedCoverPhoto);
    formData.append('name', currentProfile.name);
    formData.append('slug', currentProfile.slug);
    const result = await API.bulkUpdateUser(profile.id, signature, message, formData);
    dispatch(setUser(result));
    dispatch(initProfile(profile.id));
    setIsLoading(false);
    setActiveModal('');
  };

  if (isLoading) {
    return <LoadingSpinner message="Updating profile" />;
  }

  return (
    <ScProfileEditModal>
      <FormLabel>Account Name</FormLabel>
      <Input
        type="text"
        value={currentProfile.name}
        onChange={e => setCurrentProfile({ ...profile, name: e.target.value })}
        onClick={e => e.target.setSelectionRange(0, e.target.value.length)}
      />
      <FormLabel>Profile Slug</FormLabel>
      <Input
        type="text"
        value={currentProfile.slug}
        onChange={e => setCurrentProfile({ ...profile, name: e.target.value })}
        onClick={e => e.target.setSelectionRange(0, e.target.value.length)}
      />
      <FormLabel>Profile Photo</FormLabel>
      <div className="photoUpload-container">
        <img className="profilePhoto" alt="profilePhoto" src={currentProfile.profilePhoto} />
        <Button size={BUTTON_SIZE_MAP[deviceType]} colorScheme="linkedin" onClick={handleOpenProfilePhotoUpload}>
          Change Profile Photo
        </Button>
        <input ref={profilePhotoUploadRef} type="file" onChange={handleProfilePhotoUpload} style={{ display: 'none' }} />
      </div>
      <FormLabel>Cover Photo</FormLabel>
      <div className="photoUpload-container">
        <img className="coverPhoto" alt="coverPhoto" src={currentProfile.coverPhoto} />
        <Button size={BUTTON_SIZE_MAP[deviceType]} colorScheme="linkedin" onClick={handeOpenCoverPhotoUpload}>
          Change Cover Photo
        </Button>
        <input ref={coverPhotoUploadRef} type="file" onChange={handleCoverPhotoUpload} style={{ display: 'none' }} />
      </div>
      <Button colorScheme="linkedin" className="submitButton" size={BUTTON_SIZE_MAP[deviceType]} type="submit" onClick={handleSubmitData}>
        Save Changes
      </Button>
    </ScProfileEditModal>
  );
};

export default ProfileEditModal;
