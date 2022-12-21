import React, { useEffect, useState } from 'react';
import { string } from 'prop-types';
import { useSelector } from 'react-redux';
import API from '../../modules/api';
import ScProfileHeader from './ScProfileHeader';
import ImageUpload from '../ImageUpload';
import { ReactComponent as DefaultProfilePhoto } from '../../assets/default-profile-photo.svg';
import { generateSignatureData } from '../../utils';
import { getIsProfileOwner } from '../../store/selectors';

const ProfileHeader = ({ id }) => {
  const [profilePhoto, setProfilePhoto] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [username, setUsername] = useState('');
  const isProfileOwner = useSelector(getIsProfileOwner);

  useEffect(() => {
    API.getProfilePhoto(id).then(response => setProfilePhoto(response?.url));
    API.getCoverPhoto(id).then(response => setCoverPhoto(response?.url));
    API.getUsername(id).then(response => setUsername(response?.name || 'Unnamed'));
  }, [id]);

  const handleCoverPhotoUpload = async e => {
    e.preventDefault();
    const { signature, message } = await generateSignatureData();
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('cover-photo', file);
        API.uploadCoverPhoto(id, signature, message, formData).then(response => setCoverPhoto(response.url));
      } catch (error) {
        console.warn('Error on uploading file', error);
      }
    }
  };

  const handleProfilePhotoUpload = async e => {
    e.preventDefault();
    const { signature, message } = await generateSignatureData();
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('profile-photo', file);
        API.uploadProfilePhoto(id, signature, message, formData).then(response => setProfilePhoto(response.url));
      } catch (error) {
        console.warn('Error on uploading file', error);
      }
    }
  };

  return (
    <ScProfileHeader>
      <div className="profile-photos">
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
