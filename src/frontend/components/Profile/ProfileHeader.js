import React, { useEffect, useState } from 'react';
import { bool, string } from 'prop-types';
import ScProfileHeader from './ScProfileHeader';

const ProfileHeader = ({ id, isOwner }) => {
  const [profilePhoto, setProfilePhoto] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [username, setUsername] = useState('');

  const getProfilePhoto = async () => fetch(`http://localhost:3001/user/profile-photo?id=${id}`, {
    method: 'GET'
  }).then(response => response.json());

  const getCoverPhoto = async () => fetch(`http://localhost:3001/user/cover-photo?id=${id}`, {
    method: 'GET'
  }).then(response => response.json());

  const getUsername = async () => fetch(`http://localhost:3001/user/name?id=${id}`, {
    method: 'GET'
  }).then(response => response.json());

  useEffect(() => {
    getProfilePhoto().then(response => setProfilePhoto(response.url));
    getCoverPhoto().then(response => setCoverPhoto(response.url));
    getUsername().then(response => setUsername(response.name));
  });

  return (
    <ScProfileHeader>
      <img className="cover-photo" src={coverPhoto} alt="coverPhoto" />
      <div className="profile-info">
        <img className="profile-photo" src={profilePhoto} alt="profilePhoto" />
        <div className="profile-names">
          <h1 className="profile-names-name">{username || 'Michael Scott'}</h1>
          <h2 className="profile-names-id">{id}</h2>
        </div>
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
