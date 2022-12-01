import React, { useEffect, useState } from 'react';
import { bool, string } from 'prop-types';
import API from '../../modules/api';
import ScProfileHeader from './ScProfileHeader';
import ImageUpload from "../ImageUpload";
import { generateSignatureData } from "../../utils";

const ProfileHeader = ({ id, isOwner, account }) => {
  const [profilePhoto, setProfilePhoto] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    API.getProfilePhoto(id).then(response => setProfilePhoto(response.url));
    API.getCoverPhoto(id).then(response => setCoverPhoto(response.url));
    API.getUsername(id).then(response => setUsername(response.name));
  }, []);

  const handleCoverPhotoUpload = async (e) => {
    e.preventDefault();
    const { signature, message } = await generateSignatureData();
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('cover-photo', file);
        API.uploadCoverPhoto(id, signature, account, message, formData).then(response => setCoverPhoto(response.url));
      } catch (error) {
        console.warn('Error on uploading file', error);
      }
    }
  };

  const handleProfilePhotoUpload = async (e) => {
    e.preventDefault();
    const { signature, message } = await generateSignatureData();
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('profile-photo', file);
        API.uploadProfilePhoto(id, signature, account, message, formData).then(response => setProfilePhoto(response.url));
      } catch (error) {
        console.warn('Error on uploading file', error);
      }
    }
  };

  return (
    <ScProfileHeader>
      <div className="profile-photos">
        <div className="cover-photo">
          { isOwner && (<ImageUpload onUpload={handleCoverPhotoUpload} />) }
          <img className="cover-photo-image" alt="coverPhoto" src={coverPhoto} />
        </div>
        <div className="profile-photo">
          { isOwner && (<ImageUpload onUpload={handleProfilePhotoUpload} />) }
          <img className="profile-photo-image" alt="profilePhoto"  src={profilePhoto} />
        </div>
      </div>
      <div className="profile-names">
        {username && <h1 className="profile-names-name">{username}</h1>}
        <h2 className="profile-names-id">@{id}</h2>
      </div>
    </ScProfileHeader>
  );
};

ProfileHeader.propTypes = {
  id: string,
  isOwner: bool
};

ProfileHeader.defaultProps = {
  id: '',
  isOwner: false
};



export default ProfileHeader;
