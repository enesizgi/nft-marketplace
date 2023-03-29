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
    &:not([aria-invalid]) {
      margin-bottom: 20px;
    }
  }
  label {
    font-weight: 600;
  }
  button {
    word-wrap: break-word;
  }
  .chakra-form__helper-text {
    margin-bottom: 20px;
    color: red;
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
  .upload-button-container {
    max-width: calc(50% - 20px);
    display: flex;
    flex-direction: column;
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

  .form-footer {
    margin-top: 20px;
    align-self: center;
    display: flex;
    justify-content: center;
    align-items: center;
    > div {
      font-weight: 600;
      font-size: 16px;
      margin: 0 10px;
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
      if (file.size > 1024 * 1024 * 5) {
        setErrorMessages({ ...errorMessages, profile: 'Image size should be less than 5MB.' });
        return;
      }
      setErrorMessages({ ...errorMessages, profile: '' });
      setUploadedProfilePhoto(file);
      const url = URL.createObjectURL(file);
      setCurrentProfile({ ...currentProfile, profilePhoto: url });
    }
  };

  const handleCoverPhotoUpload = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024 * 5) {
        setErrorMessages({ ...errorMessages, cover: 'Image size should be less than 5MB.' });
        return;
      }
      setErrorMessages({ ...errorMessages, profile: '' });
      setUploadedCoverPhoto(file);
      const url = URL.createObjectURL(file);
      setCurrentProfile({ ...currentProfile, coverPhoto: url });
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
        setCurrentProfile({ ...currentProfile, slug: profile.slug });
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
    if (uploadedProfilePhoto) formData.append('coverPhoto', uploadedCoverPhoto);
    if (uploadedCoverPhoto) formData.append('profilePhoto', uploadedProfilePhoto);
    const qs = {
      id: profile.id,
      signature,
      message,
      name: currentProfile.name,
      slug: currentProfile.slug
    };

    try {
      const result = await API.bulkUpdateUser(qs, formData);
      dispatch(setUser(result));
      dispatch(initProfile(profile.id));
      setIsLoading(false);
      dispatch(setActiveModal(''));
    } catch (e) {
      setErrorMessages({ ...errorMessages, formError: 'Error occurred during profile update.' });
    }
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
        <div className="upload-button-container">
          <Button size={BUTTON_SIZE_MAP[deviceType]} colorScheme="linkedin" onClick={handleOpenProfilePhotoUpload}>
            Change Profile Photo
          </Button>
          <FormHelperText>{errorMessages.profile}</FormHelperText>
        </div>
        <input ref={profilePhotoUploadRef} type="file" accept="image/*" onChange={handleProfilePhotoUpload} style={{ display: 'none' }} />
      </div>
      <FormLabel htmlFor="coverPhoto">Cover Photo</FormLabel>
      <div className="photoUpload-container">
        <img className="coverPhoto" alt="coverPhoto" id="coverPhoto" src={currentProfile.coverPhoto} />
        <div className="upload-button-container">
          <Button size={BUTTON_SIZE_MAP[deviceType]} colorScheme="linkedin" onClick={handeOpenCoverPhotoUpload}>
            Change Cover Photo
          </Button>
          <FormHelperText>{errorMessages.cover}</FormHelperText>
        </div>
        <input ref={coverPhotoUploadRef} type="file" accept="image/*" onChange={handleCoverPhotoUpload} style={{ display: 'none' }} />
      </div>
      <div className="form-footer">
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
        <FormHelperText>{errorMessages.formError}</FormHelperText>
      </div>
    </ScProfileEditModal>
  );
};

export default ProfileEditModal;
