import React, { useEffect, useRef, useState } from 'react';
import { Input, FormLabel, FormHelperText } from '@chakra-ui/react';
import isEqual from 'lodash/isEqual';
import { useDispatch, useSelector } from 'react-redux';
import { getButtonSize } from '../../../store/selectors';
import { setActiveModal } from '../../../store/uiSlice';
import API from '../../../modules/api';
import { initProfile } from '../../../store/actionCreators';
import { setUser } from '../../../store/userSlice';
import LoadingSpinner from '../../LoadingSpinner';
import ScProfileEditModal from './ScProfileEditModal';
import Button from '../../Button';
import { classNames, generateSignatureData, getSignedMessage, updateSignedMessage } from '../../../utils';

const ProfileEditModal = ({ profile }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [uploadedCoverPhoto, setUploadedCoverPhoto] = useState();
  const [uploadedProfilePhoto, setUploadedProfilePhoto] = useState();
  const [errorMessages, setErrorMessages] = useState({});
  const profilePhotoUploadRef = useRef();
  const coverPhotoUploadRef = useRef();
  const dispatch = useDispatch();
  const buttonSize = useSelector(getButtonSize);
  const signedMessage = getSignedMessage();

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
        setErrorMessages(prev => ({ ...prev, profile: 'Image size should be less than 5MB.' }));
        return;
      }
      setErrorMessages(prev => ({ ...prev, profile: '' }));
      setUploadedProfilePhoto(file);
      const url = URL.createObjectURL(file);
      setCurrentProfile(prev => ({ ...prev, profilePhoto: url }));
    }
  };

  const handleCoverPhotoUpload = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024 * 5) {
        setErrorMessages(prev => ({ ...prev, cover: 'Image size should be less than 5MB.' }));
        return;
      }
      setErrorMessages(prev => ({ ...prev, profile: '' }));
      setUploadedCoverPhoto(file);
      const url = URL.createObjectURL(file);
      setCurrentProfile(prev => ({ ...prev, coverPhoto: url }));
    }
  };

  const validateName = e => {
    if (!e.target.value) {
      setCurrentProfile(prev => ({ ...prev, name: profile.name }));
      setErrorMessages(prev => ({ ...prev, name: 'Account name cannot be empty' }));
    } else {
      setCurrentProfile(prev => ({ ...prev, name: e.target.value }));
      setErrorMessages(prev => ({ ...prev, name: '' }));
    }
  };

  const validateSlug = async e => {
    if (e.target.value) {
      if (e.target.value.startsWith('0x')) {
        setErrorMessages(prev => ({ ...prev, slug: 'Slug cannot start with 0x' }));
        setCurrentProfile(prev => ({ ...prev, slug: profile.slug }));
        return false;
      }
      const result = await API.getUserBySlug(currentProfile.slug);
      if (result && result.id !== currentProfile.id) {
        setErrorMessages(prev => ({ ...prev, slug: 'This slug is being used by another user.' }));
        setCurrentProfile(prev => ({ ...prev, slug: profile.slug }));
        return false;
      }
      setCurrentProfile(prev => ({ ...prev, slug: e.target.value }));
      setErrorMessages(prev => ({ ...prev, slug: '' }));
      return true;
    }
    setCurrentProfile(prev => ({ ...prev, slug: null }));
    return true;
  };

  const handleSubmitData = async () => {
    setIsLoading(true);
    const { signature, message } = await generateSignatureData(signedMessage);
    updateSignedMessage(signedMessage, signature, message);
    const formData = new FormData();
    formData.append('coverPhoto', uploadedCoverPhoto);
    formData.append('profilePhoto', uploadedProfilePhoto);
    const qs = {
      id: profile.id,
      signature,
      message,
      name: currentProfile.name,
      slug: JSON.stringify(currentProfile.slug)
    };

    try {
      const result = await API.bulkUpdateUser(qs, formData);
      dispatch(setUser(result));
      dispatch(initProfile(profile.id));
      setIsLoading(false);
      dispatch(setActiveModal(''));
    } catch (e) {
      setErrorMessages(prev => ({ ...prev, formError: 'Error occurred during profile update.' }));
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
        onChange={e => setCurrentProfile(prev => ({ ...prev, name: e.target.value }))}
        onBlur={validateName}
        onClick={e => e.target.setSelectionRange(0, e.target.value.length)}
      />
      <FormHelperText>{errorMessages.name}</FormHelperText>
      <FormLabel htmlFor="slug">Profile Slug</FormLabel>
      <Input
        type="text"
        id="slug"
        value={currentProfile.slug ?? ''}
        isInvalid={!!errorMessages.slug}
        onChange={e => setCurrentProfile(prev => ({ ...prev, slug: e.target.value }))}
        onBlur={validateSlug}
        onClick={e => e.target.setSelectionRange(0, e.target.value.length)}
      />
      <FormHelperText>{errorMessages.slug}</FormHelperText>
      <div className="photoUpload-group">
        <div
          className={classNames({
            'photoUpload-container': true,
            'no-photo': !currentProfile.profilePhoto
          })}
        >
          {currentProfile.profilePhoto && (
            <>
              <FormLabel htmlFor="profilePhoto">Profile Photo</FormLabel>
              <div className="profilePhoto-container">
                <img className="profilePhoto" alt="profilePhoto" id="profilePhoto" src={currentProfile.profilePhoto} />
              </div>
            </>
          )}
          <div className="upload-button-container">
            <Button size={buttonSize} className="outline" onClick={handleOpenProfilePhotoUpload}>
              {currentProfile.profilePhoto ? 'Change' : 'Upload'}
            </Button>
            <FormHelperText>{errorMessages.profile}</FormHelperText>
          </div>
          <input ref={profilePhotoUploadRef} type="file" accept="image/*" onChange={handleProfilePhotoUpload} style={{ display: 'none' }} />
        </div>
        <div
          className={classNames({
            'photoUpload-container': true,
            'no-photo': !currentProfile.coverPhoto
          })}
        >
          {currentProfile.coverPhoto && (
            <>
              <FormLabel htmlFor="coverPhoto">Cover Photo</FormLabel>
              <div className="coverPhoto-container">
                <img className="coverPhoto" alt="coverPhoto" id="coverPhoto" src={currentProfile.coverPhoto} />
              </div>
            </>
          )}
          <div className="upload-button-container">
            <Button size={buttonSize} className="outline" onClick={handeOpenCoverPhotoUpload}>
              {currentProfile.profilePhoto ? 'Change' : 'Upload'}
            </Button>
            <FormHelperText>{errorMessages.cover}</FormHelperText>
          </div>
          <input ref={coverPhotoUploadRef} type="file" accept="image/*" onChange={handleCoverPhotoUpload} style={{ display: 'none' }} />
        </div>
      </div>
      <div className="form-footer">
        <Button isDisabled={!isChanged} className="submitButton" size={buttonSize} type="submit" onClick={handleSubmitData}>
          Save Changes
        </Button>
        <FormHelperText>{errorMessages.formError}</FormHelperText>
      </div>
    </ScProfileEditModal>
  );
};

export default ProfileEditModal;
