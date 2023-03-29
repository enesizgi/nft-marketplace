import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Input, FormControl, FormLabel, Button, FormHelperText } from '@chakra-ui/react';
import isEqual from 'lodash/isEqual';
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
  .chakra-form__helper-text {
    transform: translateY(-20px);
    color: red;
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
  const [isChanged, setIsChanged] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [uploadedCoverPhoto, setUploadedCoverPhoto] = useState();
  const [uploadedProfilePhoto, setUploadedProfilePhoto] = useState();
  const [errorMessages, setErrorMessages] = useState({});
  const profilePhotoUploadRef = useRef();
  const coverPhotoUploadRef = useRef();
  const dispatch = useDispatch();
  const deviceType = useSelector(getDeviceType);
  const signedMessage = useSelector(getSignedMessage);

  useEffect(() => {
    setIsChanged(!isEqual(profile, currentProfile));
  }, [currentProfile, profile]);

  const handleOpenProfilePhotoUpload = () => {
    profilePhotoUploadRef.current?.click();
  };

  const handeOpenCoverPhotoUpload = () => {
    coverPhotoUploadRef.current?.click();
  };

  const handleProfilePhotoUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setUploadedProfilePhoto(file);
      const url = URL.createObjectURL(file);
      setCurrentProfile({ ...currentProfile, profilePhoto: url });
      setErrorMessages({ ...errorMessages, profile: '' });
    } else {
      setErrorMessages({ ...errorMessages, profile: 'Please upload a valid profile photo.' });
    }
  };

  const handleCoverPhotoUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setUploadedCoverPhoto(file);
      const url = URL.createObjectURL(file);
      setCurrentProfile({ ...currentProfile, coverPhoto: url });
      setErrorMessages({ ...errorMessages, cover: '' });
    } else {
      setErrorMessages({ ...errorMessages, cover: 'Please upload a valid cover photo.' });
    }
  };

  const validateName = e => {
    if (!e.target.value) {
      setCurrentProfile({ ...currentProfile, name: profile.name });
      setErrorMessages({ ...errorMessages, name: 'Account name cannot be empty' });
    } else {
      setCurrentProfile({ ...currentProfile, name: e.target.value });
      setErrorMessages({ ...errorMessages, name: '' });
    }
  };

  const validateSlug = async e => {
    if (e.target.value) {
      const result = await API.getUserBySlug(currentProfile.slug);
      if (result && result.id !== currentProfile.id) {
        setErrorMessages({ ...errorMessages, slug: 'This slug is being used by another user.' });
      } else {
        setCurrentProfile({ ...currentProfile, slug: e.target.value });
        setErrorMessages({ ...errorMessages, slug: '' });
      }
    } else {
      setCurrentProfile({ ...currentProfile, slug: null });
    }
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
      <FormLabel htmlFor="name">Account Name</FormLabel>
      <Input
        type="text"
        id="name"
        value={currentProfile.name}
        isInvalid={!!errorMessages.name}
        onChange={e => setCurrentProfile({ ...currentProfile, name: e.target.value })}
        onBlur={validateName}
        onClick={e => e.target.setSelectionRange(0, e.target.value.length)}
      />
      <FormHelperText>{errorMessages.name}</FormHelperText>
      <FormLabel htmlFor="slug">Profile Slug</FormLabel>
      <Input
        type="text"
        id="slug"
        value={currentProfile.slug}
        isInvalid={!!errorMessages.slug}
        onChange={e => setCurrentProfile({ ...currentProfile, slug: e.target.value })}
        onBlur={validateSlug}
        onClick={e => e.target.setSelectionRange(0, e.target.value.length)}
      />
      <FormHelperText>{errorMessages.slug}</FormHelperText>
      <FormLabel htmlFor="profilePhoto">Profile Photo</FormLabel>
      <div className="photoUpload-container">
        <img className="profilePhoto" alt="profilePhoto" id="profilePhoto" src={currentProfile.profilePhoto} />
        <Button size={BUTTON_SIZE_MAP[deviceType]} colorScheme="linkedin" onClick={handleOpenProfilePhotoUpload}>
          Change Profile Photo
        </Button>
        <input ref={profilePhotoUploadRef} type="file" accept="image/*" onChange={handleProfilePhotoUpload} style={{ display: 'none' }} />
        <FormHelperText>{errorMessages.profile}</FormHelperText>
      </div>
      <FormLabel htmlFor="coverPhoto">Cover Photo</FormLabel>
      <div className="photoUpload-container">
        <img className="coverPhoto" alt="coverPhoto" id="coverPhoto" src={currentProfile.coverPhoto} />
        <Button size={BUTTON_SIZE_MAP[deviceType]} colorScheme="linkedin" onClick={handeOpenCoverPhotoUpload}>
          Change Cover Photo
        </Button>
        <input ref={coverPhotoUploadRef} type="file" accept="image/*" onChange={handleCoverPhotoUpload} style={{ display: 'none' }} />
        <FormHelperText>{errorMessages.cover}</FormHelperText>
      </div>
      <Button
        isDisabled={!isChanged}
        colorScheme="linkedin"
        className="submitButton"
        size={BUTTON_SIZE_MAP[deviceType]}
        type="submit"
        onClick={handleSubmitData}
      >
        Save Changes
      </Button>
    </ScProfileEditModal>
  );
};

export default ProfileEditModal;
